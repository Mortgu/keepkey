import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Die Eigentümer-Regel der gemeinsamen Dokumenttabelle (document_record) lebt als
 * handgeschriebener CHECK in der Migration (#73), nicht im Prisma-Schema — deshalb
 * wird sie hier gegen die echten Migrationen geprüft: genau der zu `type` passende
 * Eltern-FK muss gesetzt sein.
 */
const migrations = new URL("../../prisma/migrations/", import.meta.url);
let db: PGlite;

beforeAll(async () => {
    db = new PGlite();
    for (const name of (await readdir(migrations)).filter((n) => /^\d/.test(n)).sort()) {
        await db.exec(await readFile(new URL(`${name}/migration.sql`, migrations), "utf8"));
    }
    await db.exec(`
        INSERT INTO "user" (id, name, salutation, "firstName", "lastName", email, "emailVerified", "createdAt", "updatedAt")
            VALUES ('user', 'Test User', '', 'Test', 'User', 'test@example.com', false, now(), now());
        INSERT INTO customer (id, "companyName", "taxRate", "updatedAt") VALUES ('customer', 'Customer Ltd', 19, now());
        INSERT INTO contact_person (id, "customerId", "firstName", "lastName", "updatedAt") VALUES ('contact', 'customer', 'First', 'Last', now());
        INSERT INTO contract (id, "updatedAt") VALUES ('contract', now());
        INSERT INTO offer (id, "customerId", "contactPersonId", "userId", "contractId", duration_months, "quoteId", "paymentTerm", netAmount, "updatedAt")
            VALUES ('offer', 'customer', 'contact', 'user', 'contract', 12, 'Q-1', '30 Tage', 100, now());
    `);
});

afterAll(async () => {
    await db.close();
});

let taskCounter = 0;

/** Legt einen Task an und versucht dann, ein Dokument mit den gegebenen Eltern-Spalten einzufügen. */
async function insertDocument(type: string, parents: Partial<Record<"offerId" | "orderId" | "confirmationId" | "invoiceId", string>>) {
    const taskId = `task-${++taskCounter}`;
    await db.query(`INSERT INTO task (id, target, type, "updatedAt") VALUES ($1, 'OFFER', 'GENERATION', now())`, [taskId]);
    const columns = Object.keys(parents).map((c) => `"${c}"`);
    const values = Object.values(parents);
    await db.query(
        `INSERT INTO document_record (id, type, status, "taskId", "updatedAt"${columns.map((c) => `, ${c}`).join("")})
         VALUES ($1, $2::"DocumentOwnerType", 'PENDING', $3, now()${values.map((_, i) => `, $${i + 4}`).join("")})`,
        [`doc-${taskId}`, type, taskId, ...values],
    );
}

const ownerCheckViolation = { code: "23514", constraint: "document_record_type_owner_check" };

describe("document_record ownership CHECK", () => {
    it("accepts a document whose only parent matches its type", async () => {
        await expect(insertDocument("OFFER", { offerId: "offer" })).resolves.toBeUndefined();
    });

    it("rejects a document with no parent at all", async () => {
        await expect(insertDocument("OFFER", {})).rejects.toMatchObject(ownerCheckViolation);
    });

    it("rejects a document with two parents set", async () => {
        await expect(insertDocument("OFFER", { offerId: "offer", orderId: "order" })).rejects.toMatchObject(ownerCheckViolation);
    });

    it("rejects a document whose parent doesn't match its type", async () => {
        await expect(insertDocument("OFFER", { orderId: "order" })).rejects.toMatchObject(ownerCheckViolation);
    });
});
