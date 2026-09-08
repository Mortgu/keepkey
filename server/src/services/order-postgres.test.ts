/** Optional real-PostgreSQL concurrency tests. Only an explicitly supplied test URL is used. */
import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import pg from "pg";

const state = vi.hoisted(() => ({
    schema: `order_test_${Date.now()}_${Math.random().toString(36).slice(2)}`,
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
vi.mock("./document-generation-request.service.js", () => ({
    requestOrderGeneration: vi.fn(),
}));
import { prisma } from "../lib/prismaClient.js";
import {
    createOrder,
    updateOrder,
    getOrderById,
    cancelOrder,
    restoreOrderRevision,
} from "./order.service.js";
import { assertOfferEditable } from "./offer-acceptance.service.js";
import { getCustomers, getCustomerById } from "./customer.service.js";
import { getSuppliers } from "./supplier.service.js";
import { getDashboardStats } from "./dashboard.service.js";
import { search } from "./search.service.js";
import { metadataSnapshot } from "../schemas/order-inputs.js";

const integration = describe.skipIf(!process.env.ORDER_TEST_DATABASE_URL);
integration("real PostgreSQL acceptance transactions", () => {
    let pool: pg.Pool;
    beforeAll(async () => {
        pool = new pg.Pool({
            connectionString: process.env.ORDER_TEST_DATABASE_URL,
        });
        await pool.query(`CREATE SCHEMA "${state.schema}"`);
        const client = await pool.connect();
        try {
            await client.query(`SET search_path TO "${state.schema}"`);
            const directory = new URL(
                "../../prisma/migrations/",
                import.meta.url,
            );
            for (const name of (await readdir(directory))
                .filter((n) => /^\d/.test(n))
                .sort()) {
                const sql = await readFile(
                    new URL(`${name}/migration.sql`, directory),
                    "utf8",
                );
                // Historical migrations qualify enum names with public; scope those to the isolated test schema.
                await client.query(
                    sql
                        .replaceAll('"public".', `"${state.schema}".`)
                        .replaceAll("public.", `"${state.schema}".`),
                );
            }
        } finally {
            await client.query("ROLLBACK");
            client.release();
        }
        await prisma.user.create({
            data: {
                id: "user",
                name: "Test User",
                salutation: "",
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
        await prisma.customer.create({
            data: {
                id: "customer",
                companyName: "Original Ltd",
                language: "EN",
            },
        });
        await prisma.contactPerson.create({
            data: {
                id: "contact",
                customerId: "customer",
                firstName: "First",
                lastName: "Last",
            },
        });
        await prisma.contract.create({
            data: {
                id: "contract",
                translations: {
                    create: {
                        language: "EN",
                        name: "Original contract",
                        features: [],
                        table: "Terms",
                    },
                },
            },
        });
        await prisma.product.create({
            data: {
                id: "product",
                translations: {
                    create: {
                        language: "EN",
                        name: "Original product",
                        description: "Original description",
                        table: "Original table",
                    },
                },
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
    async function draft() {
        const id = randomUUID();
        return prisma.offer.create({
            data: {
                id,
                customerId: "customer",
                contactPersonId: "contact",
                userId: "user",
                contractId: "contract",
                duration_months: 12,
                quoteId: id,
                paymentTerm: "30 days",
                net_amount: 80000,
                language: "EN",
                offerPositions: {
                    create: {
                        productId: "product",
                        quantity: 10,
                        total_cents: 120000,
                        eur_user_month: 1000,
                        discount_cents: 30000,
                        free_months: 3,
                    },
                },
                offerDiscounts: {
                    create: { title: "Discount", amount_cents: 10000 },
                },
            },
        });
    }
    const input = (id: string) => ({
        id,
        orderId: randomUUID(),
        expectedOfferVersion: 1,
    });
    it("allows exactly one of two simultaneous acceptances", async () => {
        const offer = await draft();
        const results = await Promise.allSettled([
            createOrder(input(offer.id), "user"),
            createOrder(input(offer.id), "user"),
        ]);
        expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
        expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
        expect(await prisma.order.count({ where: { offerId: offer.id } })).toBe(
            1,
        );
    });
    it("serializes acceptance with an in-flight edit and rejects its stale expected version", async () => {
        const offer = await draft();
        let signal!: () => void;
        let release!: () => void;
        const locked = new Promise<void>((resolve) => {
            signal = resolve;
        });
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        const edit = prisma.$transaction(async (tx) => {
            await assertOfferEditable(tx, offer.id);
            signal();
            await gate;
            await tx.offer.update({
                where: { id: offer.id },
                data: { version: { increment: 1 } },
            });
        });
        await locked;
        const acceptance = createOrder(input(offer.id), "user");
        const result = expect(acceptance).rejects.toMatchObject({
            code: "VERSION_CONFLICT",
        });
        release();
        await edit;
        await result;
        expect(await prisma.order.count({ where: { offerId: offer.id } })).toBe(
            0,
        );
        expect(
            (await prisma.offer.findUniqueOrThrow({ where: { id: offer.id } }))
                .acceptedAt,
        ).toBeNull();
    });
    it("rolls back the offer lock and snapshot when the order cannot be inserted", async () => {
        const first = await draft();
        const existing = await createOrder(input(first.id), "user");
        const second = await draft();
        await expect(
            createOrder(
                { ...input(second.id), orderId: existing.orderId },
                "user",
            ),
        ).rejects.toThrow();
        const unchanged = await prisma.offer.findUniqueOrThrow({
            where: { id: second.id },
        });
        expect(unchanged.acceptedAt).toBeNull();
        expect(unchanged.acceptedSnapshot).toBeNull();
    });
    it("metadata edits and restores preserve the accepted price and frozen master data", async () => {
        const offer = await draft();
        const order = await createOrder(input(offer.id), "user");
        await prisma.customer.update({
            where: { id: "customer" },
            data: { companyName: "Changed Ltd" },
        });
        const { order: metadata } = metadataSnapshot(order);
        await updateOrder(
            order.id,
            {
                expectedVersion: 1,
                order: { ...metadata, projectNumber: "New project" },
            },
            "user",
        );
        const revision = await prisma.orderRevision.findFirstOrThrow({
            where: { orderId: order.id, version: 1 },
        });
        await restoreOrderRevision(order.id, revision.id, 2, "user");
        const restored = await getOrderById(order.id);
        expect(restored.net_amount).toBe(80000);
        expect(restored.projectNumber).toBeNull();
        expect(restored.customer.companyName).toBe("Original Ltd");
        await cancelOrder(order.id, 3, "user");
        await expect(
            prisma.$transaction((tx) => assertOfferEditable(tx, offer.id)),
        ).rejects.toMatchObject({ code: "OFFER_ACCEPTED" });
        await expect(
            updateOrder(
                order.id,
                { expectedVersion: 4, order: metadata },
                "user",
            ),
        ).rejects.toMatchObject({ code: "ORDER_CANCELLED" });
    });
    it("resolves list counts, search and dashboard volumes through the accepted offer", async () => {
        const offer = await draft();
        const order = await createOrder(input(offer.id), "user");
        const customers = await getCustomers({});
        expect(customers[0]?._count.orders).toBeGreaterThan(0);
        expect(
            (await getCustomerById("customer"))._count.orders,
        ).toBeGreaterThan(0);
        expect(await getSuppliers({})).toEqual([]);
        const results = await search(order.orderId, "order");
        expect(results.items[0]?.id).toBe(order.id);
        const before = await getDashboardStats();
        await cancelOrder(order.id, 1, "user");
        const after = await getDashboardStats();
        expect(after.totals.orders.volume_cents).toBe(
            before.totals.orders.volume_cents - 80000,
        );
        expect(after.totals.offers).toEqual(before.totals.offers);
    });
});
