import { readFile } from "node:fs/promises";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import { customParser } from "../pipelines/offer/utils.js";
import { orderTemplateSchema } from "../schemas/templates/order.template.schema.js";
import { describe, expect, it, vi } from "vitest";
vi.mock("../lib/prismaClient.js", () => ({ prisma: {} }));
vi.mock("./document-generation-request.service.js", () => ({
    requestOrderGeneration: vi.fn(),
}));
import { presentOrder } from "./order-source.js";
import { formatOrderData } from "../pipelines/order/actions.js";
import {
    parseAcceptedOfferSnapshot,
    serializeAcceptedOfferSnapshot,
} from "../schemas/accepted-offer.js";
import {
    acceptOrderSchema,
    updateOrderMetadataSchema,
    metadataSnapshot,
    parseMetadataRevision,
} from "../schemas/order-inputs.js";
import {
    orderFixture,
    sourceFixture,
    templateFixture,
} from "../test/order-fixtures.js";

describe("accepted offer order data", () => {
    it("keeps free months, offer discounts and totals when metadata changes", () => {
        const order = orderFixture();
        const before = presentOrder(order);
        const after = presentOrder({
            ...order,
            projectNumber: "Changed",
            version: 2,
        });
        expect(after.net_amount).toBe(90000);
        expect(after.orderPositions[0]?.total_cents).toBe(90000);
        expect(after.discounts).toEqual(before.discounts);
        expect(after.positions[0]?.eur_user_month).toBe(1000);
        expect(after.projectNumber).toBe("Changed");
        expect(after.offer).not.toHaveProperty("acceptedSnapshot");
    });
    it("freezes master data and strips private user fields at the snapshot boundary", () => {
        const source = sourceFixture();
        const snapshot = serializeAcceptedOfferSnapshot(
            {
                ...source,
                employee: { ...source.employee, sessions: ["secret"] },
            },
            templateFixture(),
        );
        source.customer.street = "Changed street";
        source.positions[0]!.product.translations[0]!.name = "Changed product";
        const frozen = parseAcceptedOfferSnapshot(snapshot);
        expect(frozen.customer.street).toBe("Original street");
        expect(frozen.positions[0]?.product.translations[0]?.name).toBe(
            "Original product",
        );
        expect(frozen.employee).not.toHaveProperty("sessions");
    });
    it("rejects unknown snapshot versions instead of falling back to live prices", () => {
        expect(() =>
            parseAcceptedOfferSnapshot({
                schemaVersion: 99,
                source: sourceFixture(),
            }),
        ).toThrow();
    });
    it("passes positions, prices, discounts and project details to the order template in the offer language", async () => {
        const formatted = await formatOrderData({
            order: presentOrder(orderFixture()),
        });
        expect(formatted.tables[0]?.items[0]?.name).toBe("Original product");
        expect(formatted.tables[0]?.items[0]?.price.total).toBe("900,00 €");
        expect(formatted.total).toBe("900,00 €");
        expect(formatted.discounts[0]?.total).toBe("-100,00 €");
        expect(formatted.flatrates).toHaveLength(1);
        expect(formatted.projectNumber).toBe("P-1");
        expect(formatted.projectId).toBe("P-1");
        expect(formatted.offerId).toBe("Q-1");
        expect(orderTemplateSchema.safeParse(formatted).success).toBe(true);
        expect(formatted.customer.fullName).toBe("First Last");
    });
    it("requires the version shown at acceptance", () => {
        expect(
            acceptOrderSchema.safeParse({ id: "offer", orderId: "AB-1" })
                .success,
        ).toBe(false);
        expect(
            acceptOrderSchema.safeParse({
                id: "offer",
                orderId: "AB-1",
                expectedOfferVersion: 1,
            }).success,
        ).toBe(true);
    });
    it("rejects attempts to write commercial fields, positions or invalid dates", () => {
        const input = {
            expectedVersion: 1,
            ...metadataSnapshot(orderFixture()),
        };
        expect(updateOrderMetadataSchema.safeParse(input).success).toBe(true);
        expect(
            updateOrderMetadataSchema.safeParse({ ...input, positions: [] })
                .success,
        ).toBe(false);
        expect(
            updateOrderMetadataSchema.safeParse({
                ...input,
                order: { ...input.order, net_amount: 0 },
            }).success,
        ).toBe(false);
        expect(
            updateOrderMetadataSchema.safeParse({
                ...input,
                order: { ...input.order, date: "invalid" },
            }).success,
        ).toBe(false);
        expect(parseMetadataRevision(input, 1)).toEqual(input.order);
        expect(() => parseMetadataRevision(input, 2)).toThrow();
    });
    it.each(["order.docx", "order.en.docx"])(
        "renders the bundled %s with order, offer and project numbers",
        async (file) => {
            const formatted = await formatOrderData({
                order: presentOrder(orderFixture()),
            });
            const content = await readFile(
                new URL(`../../assets/templates/${file}`, import.meta.url),
            );
            const doc = new Docxtemplater(new PizZip(content), {
                paragraphLoop: true,
                linebreaks: true,
                parser: customParser,
            });
            doc.render(formatted);
            const text = doc.getFullText();
            expect(text).toContain("AB-2026-001");
            expect(text).toContain("Q-1");
            expect(text).toContain("P-1");
            expect(text).not.toContain("undefined");
        },
    );
});
