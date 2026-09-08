import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import {
    beforeAll,
    afterAll,
    beforeEach,
    afterEach,
    describe,
    expect,
    it,
} from "vitest";
import { serializeAcceptedOfferSnapshot } from "../schemas/accepted-offer.js";
import { sourceFixture, templateFixture } from "./order-fixtures.js";

const migrations = new URL("../../prisma/migrations/", import.meta.url);
const migration = await readFile(
    new URL("20260908160000_order_accepts_offer/migration.sql", migrations),
    "utf8",
);
let db: PGlite;

beforeAll(async () => {
    db = new PGlite();
    for (const name of (await readdir(migrations))
        .filter((n) => /^\d/.test(n))
        .sort()) {
        await db.exec(
            await readFile(
                new URL(`${name}/migration.sql`, migrations),
                "utf8",
            ),
        );
    }
    await db.exec(`
        INSERT INTO "user" (id, name, salutation, "firstName", "lastName", email, "emailVerified", "createdAt", "updatedAt")
            VALUES ('user', 'Test User', '', 'Test', 'User', 'test@example.com', false, now(), now());
        INSERT INTO customer (id, "companyName", "updatedAt") VALUES ('customer', 'Original Ltd', now());
        INSERT INTO contact_person (id, "customerId", "firstName", "lastName", "updatedAt") VALUES ('contact', 'customer', 'First', 'Last', now());
        INSERT INTO contract (id, "updatedAt") VALUES ('contract', now());
        INSERT INTO product (id, "updatedAt") VALUES ('product', now());
        INSERT INTO flat_rate (id, total_cents, "updatedAt") VALUES ('flat-rate', 10000, now());
        INSERT INTO offer (id, "customerId", "contactPersonId", "userId", "contractId", duration_months, "quoteId", "paymentTerm", net_amount, "updatedAt")
            VALUES ('offer', 'customer', 'contact', 'user', 'contract', 12, 'Q-1', '30 Tage', 90000, now()),
                   ('draft', 'customer', 'contact', 'user', 'contract', 12, 'Q-2', '30 Tage', 100, now());
        INSERT INTO offer_position (id, "offerId", "productId", quantity, total_cents, discount_cents, eur_user_month, "updatedAt")
            VALUES ('position', 'offer', 'product', 10, 120000, 30000, 1000, now());
        INSERT INTO offer_flat_rate (id, "offerId", "flatRateId", quantity, total_cents) VALUES ('flat', 'offer', 'flat-rate', 1, 10000);
        INSERT INTO offer_discount (id, "offerId", title, amount_cents, "updatedAt") VALUES ('discount', 'offer', 'Discount', 10000, now());
    `);
    await db.query(
        `UPDATE offer SET "acceptedAt" = '2026-09-08T12:00:00Z', "acceptedSnapshot" = $1 WHERE id = 'offer'`,
        [
            JSON.stringify(
                serializeAcceptedOfferSnapshot(
                    sourceFixture(),
                    templateFixture(),
                ),
            ),
        ],
    );
    await db.exec(`INSERT INTO "order" (id, "offerId", "orderId", "acceptedAt", "acceptedById", "updatedAt")
        VALUES ('order', 'offer', 'AB-1', '2026-09-08T12:00:00Z', 'user', now());`);
}, 20000);
afterAll(async () => {
    await db?.close();
});
beforeEach(async () => {
    await db.exec("BEGIN");
});
afterEach(async () => {
    await db.exec("ROLLBACK");
});

describe("order migration and PostgreSQL invariants", () => {
    it("removes the duplicated commercial tables and columns", async () => {
        const tables = await db.query(
            `SELECT table_name FROM information_schema.tables WHERE table_name IN ('order_position', 'order_flat_rate')`,
        );
        expect(tables.rows).toEqual([]);
        const columns = await db.query<{ column_name: string }>(
            `SELECT column_name FROM information_schema.columns WHERE table_name = 'order'`,
        );
        expect(columns.rows.map((c) => c.column_name)).not.toContain(
            "net_amount",
        );
        expect(columns.rows.map((c) => c.column_name)).not.toContain(
            "customerId",
        );
    });
    it.each([
        `UPDATE offer SET net_amount = 0 WHERE id = 'offer'`,
        `DELETE FROM offer WHERE id = 'offer'`,
        `UPDATE offer_position SET quantity = 99 WHERE id = 'position'`,
        `DELETE FROM offer_position WHERE id = 'position'`,
        `UPDATE offer_flat_rate SET total_cents = 0 WHERE id = 'flat'`,
        `DELETE FROM offer_discount WHERE id = 'discount'`,
        `INSERT INTO offer_discount (id, "offerId", title, amount_cents, "updatedAt") VALUES ('new', 'offer', 'New', 1, now())`,
        `UPDATE offer SET "acceptedSnapshot" = '{}' WHERE id = 'offer'`,
        `UPDATE offer SET "acceptedAt" = NULL WHERE id = 'offer'`,
    ])("protects accepted content against direct SQL: %s", async (sql) => {
        await expect(db.exec(sql)).rejects.toThrow(/OFFER_ACCEPTED/);
    });
    it("allows document counters and order metadata without changing the agreed total", async () => {
        await db.exec(`UPDATE offer SET "documentVersion" = "documentVersion" + 1 WHERE id = 'offer';
            UPDATE "order" SET "projectNumber" = 'New project', version = version + 1 WHERE id = 'order';`);
        const result = await db.query<{ net_amount: number }>(
            `SELECT f.net_amount FROM "order" o JOIN offer f ON f.id = o."offerId" WHERE o.id = 'order'`,
        );
        expect(result.rows[0]?.net_amount).toBe(90000);
    });
    it("rejects orders that reference a draft", async () => {
        await expect(
            db.exec(
                `INSERT INTO "order" (id, "offerId", "orderId", "acceptedById", "updatedAt") VALUES ('bad', 'draft', 'AB-2', 'user', now())`,
            ),
        ).rejects.toThrow(/ORDER_REQUIRES_ACCEPTED_OFFER/);
    });
    it("rejects incomplete acceptance snapshots", async () => {
        await expect(
            db.exec(
                `UPDATE offer SET "acceptedAt" = now(), "acceptedSnapshot" = '{}' WHERE id = 'draft'`,
            ),
        ).rejects.toThrow(/offer_acceptance_snapshot_check/);
    });
    it.each([
        `UPDATE "order" SET "offerId" = 'draft' WHERE id = 'order'`,
        `UPDATE "order" SET "acceptedAt" = now() WHERE id = 'order'`,
        `DELETE FROM "order" WHERE id = 'order'`,
    ])("preserves order acceptance: %s", async (sql) => {
        await expect(db.exec(sql)).rejects.toThrow(
            /ORDER_SOURCE_IMMUTABLE|ORDER_DELETE_FORBIDDEN/,
        );
    });
    it("cancellation leaves the offer locked", async () => {
        await db.exec(
            `UPDATE "order" SET "cancelledAt" = now() WHERE id = 'order'`,
        );
        await expect(
            db.exec(`UPDATE offer SET net_amount = 0 WHERE id = 'offer'`),
        ).rejects.toThrow(/OFFER_ACCEPTED/);
    });
    it("aborts before any destructive DDL if unexpected orders exist", async () => {
        const other = new PGlite();
        try {
            await other.exec(
                `CREATE TABLE "order" (id text); INSERT INTO "order" VALUES ('existing');`,
            );
            await expect(other.exec(migration)).rejects.toThrow(
                /requires an empty order table/,
            );
            await other.exec("ROLLBACK");
            const rows = await other.query(`SELECT * FROM "order"`);
            expect(rows.rows).toEqual([{ id: "existing" }]);
        } finally {
            await other.close();
        }
    });
});
