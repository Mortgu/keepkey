/** Optional real-PostgreSQL tests für das Entfernen von Preistabellen. Nur mit ausdrücklich gesetzter Test-URL. */
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import pg from "pg";

const state = vi.hoisted(() => ({
    schema: `tariff_test_${Date.now()}_${Math.random().toString(36).slice(2)}`,
}));
vi.mock("../lib/prismaClient.js", async () => {
    if (!process.env.ORDER_TEST_DATABASE_URL) return { prisma: {} };
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    return {
        prisma: new PrismaClient({
            adapter: new PrismaPg(
                {
                    connectionString: process.env.ORDER_TEST_DATABASE_URL,
                    options: `-c search_path=${state.schema}`,
                },
                { schema: state.schema },
            ),
        }),
    };
});
import { prisma } from "../lib/prismaClient.js";
import { deleteTariff, deleteTariffGroup } from "./tariff.service.js";

const integration = describe.skipIf(!process.env.ORDER_TEST_DATABASE_URL);
integration("removing price tables (real PostgreSQL)", () => {
    let pool: pg.Pool;

    beforeAll(async () => {
        pool = new pg.Pool({ connectionString: process.env.ORDER_TEST_DATABASE_URL });
        await pool.query(`CREATE SCHEMA "${state.schema}"`);
        const client = await pool.connect();
        try {
            await client.query(`SET search_path TO "${state.schema}"`);
            const directory = new URL("../../prisma/migrations/", import.meta.url);
            for (const name of (await readdir(directory)).filter((n) => /^\d/.test(n)).sort()) {
                const sql = await readFile(new URL(`${name}/migration.sql`, directory), "utf8");
                // Historische Migrationen qualifizieren Enums mit public; auf das isolierte Testschema umbiegen.
                await client.query(
                    sql.replaceAll('"public".', `"${state.schema}".`).replaceAll("public.", `"${state.schema}".`),
                );
            }
        } finally {
            await client.query("ROLLBACK");
            client.release();
        }
        await prisma.user.create({
            data: {
                id: "user", name: "Test User", salutation: "", firstName: "Test", lastName: "User",
                email: "test@example.com", emailVerified: false, createdAt: new Date(), updatedAt: new Date(),
            },
        });
        await prisma.customer.create({ data: { id: "customer", companyName: "Original Ltd", language: "EN", taxRate: 19 } });
        await prisma.contactPerson.create({ data: { id: "contact", customerId: "customer", firstName: "First", lastName: "Last" } });
        for (const id of ["contract", "other-contract"]) {
            await prisma.contract.create({
                data: { id, translations: { create: { language: "EN", name: id, features: [], table: "Terms" } } },
            });
        }
        await prisma.product.create({
            data: {
                id: "product",
                translations: { create: { language: "EN", name: "Product", description: "d", table: "t" } },
            },
        });
    }, 30000);

    afterAll(async () => {
        await prisma.$disconnect();
        if (pool) {
            await pool.query(`DROP SCHEMA "${state.schema}" CASCADE`);
            await pool.end();
        }
    });

    /** Gruppe mit dem Produkt, Tarif zum Vertrag und einer angepinnten Version. */
    async function priceTable(contractId = "contract") {
        const group = await prisma.tariffGroup.create({ data: {} });
        await prisma.product.update({ where: { id: "product" }, data: { tariffGroupProducts: { deleteMany: {} } } });
        await prisma.tariffGroupProduct.create({ data: { tariffGroupId: group.id, productId: "product" } });
        const tariff = await prisma.tariff.create({ data: { tariffGroupId: group.id, contractId } });
        const version = await prisma.tariffVersion.create({
            data: { tariffId: tariff.id, version: 1, hash: randomUUID(), snapshot: {} },
        });
        return { group, tariff, version };
    }

    async function offer(options: { contractId?: string; accepted?: boolean; tariffVersionId?: string }) {
        const id = randomUUID();
        const created = await prisma.offer.create({
            data: {
                id, customerId: "customer", contactPersonId: "contact", userId: "user",
                contractId: options.contractId ?? "contract", duration_months: 12, quoteId: id,
                paymentTerm: "30 days", net_amount: 1000, language: "EN",
                offerPositions: {
                    create: {
                        id: `pos-${randomUUID()}`, productId: "product", quantity: 1, total_cents: 1000,
                        eur_user_month: 100, tariffVersionId: options.tariffVersionId,
                    },
                },
            },
            include: { offerPositions: true },
        });
        if (options.accepted) {
            // Erst nachträglich annehmen: Positionen eines angenommenen Angebots lassen sich nicht mehr anlegen (Trigger).
            // Die DB verlangt dabei einen vollständigen, versionierten Snapshot (offer_acceptance_snapshot_check).
            await prisma.offer.update({
                where: { id },
                data: { acceptedAt: new Date(), acceptedSnapshot: { schemaVersion: 1, source: {}, offerTemplate: {} } },
            });
        }
        return created;
    }

    it("removes a price table that nothing open depends on", async () => {
        const { group, tariff } = await priceTable();
        await deleteTariff(group.id, tariff.id);
        expect(await prisma.tariff.count({ where: { id: tariff.id } })).toBe(0);
    });

    it("is blocked by an open offer of the same contract using the group", async () => {
        const { group, tariff } = await priceTable();
        const open = await offer({});
        await expect(deleteTariff(group.id, tariff.id)).rejects.toMatchObject({ code: "TARIFF_IN_OPEN_OFFERS" });
        expect(await prisma.tariff.count({ where: { id: tariff.id } })).toBe(1);
        await prisma.offer.delete({ where: { id: open.id } });
    });

    it("deletes versions that no offer position pins", async () => {
        const { group, tariff, version } = await priceTable();
        await deleteTariff(group.id, tariff.id);
        expect(await prisma.tariffVersion.count({ where: { id: version.id } })).toBe(0);
    });

    it("is not blocked by an open offer of another contract", async () => {
        const { group, tariff } = await priceTable();
        const open = await offer({ contractId: "other-contract" });
        await deleteTariff(group.id, tariff.id);
        expect(await prisma.tariff.count({ where: { id: tariff.id } })).toBe(0);
        await prisma.offer.delete({ where: { id: open.id } });
    });

    it("is not blocked by an accepted offer; its pinned version survives orphaned", async () => {
        const { group, tariff, version } = await priceTable();
        const accepted = await offer({ accepted: true, tariffVersionId: version.id });
        await deleteTariff(group.id, tariff.id);
        expect(await prisma.tariff.count({ where: { id: tariff.id } })).toBe(0);
        const orphaned = await prisma.tariffVersion.findUniqueOrThrow({ where: { id: version.id } });
        expect(orphaned.tariffId).toBeNull();
        const position = await prisma.offerPosition.findUniqueOrThrow({ where: { id: accepted.offerPositions[0]!.id } });
        expect(position.tariffVersionId).toBe(version.id);
    });

    it("rejects a tariff that belongs to another group", async () => {
        const { tariff } = await priceTable();
        await expect(deleteTariff("other-group", tariff.id)).rejects.toMatchObject({ code: "TARIFF_NOT_FOUND" });
    });

    it("blocks deleting a whole group while an open offer uses it", async () => {
        const { group } = await priceTable();
        const open = await offer({});
        await expect(deleteTariffGroup(group.id)).rejects.toMatchObject({ code: "TARIFF_IN_OPEN_OFFERS" });
        await prisma.offer.delete({ where: { id: open.id } });
        await deleteTariffGroup(group.id);
        expect(await prisma.tariffGroup.count({ where: { id: group.id } })).toBe(0);
    });
});
