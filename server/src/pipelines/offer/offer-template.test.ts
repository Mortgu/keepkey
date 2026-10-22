import fs from "fs";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const calculatePrice = vi.fn();

vi.mock("@/lib/prismaClient.js", () => ({ prisma: {} }));
vi.mock("@/utils/products.js", () => ({ calculatePrice: (...args: unknown[]) => calculatePrice(...args) }));
vi.mock("@/utils/logger.js", () => ({ default: { warn: vi.fn(), info: vi.fn(), error: vi.fn() } }));
vi.mock("../../services/document-template.service.js", () => ({
    loadTemplateForRendering: vi.fn(async () =>
        fs.readFileSync(path.resolve(__dirname, "../../../assets/templates/offer.docx"))),
}));
vi.mock("../../lib/docx-to-pdf.js", () => ({ convertDocxToPdf: vi.fn(async () => Buffer.from("%PDF")) }));

const { formatOfferData } = await import("./build-offer.js");
const { offerFixture } = await import("./offer.fixture.js");
const { renderDocument } = await import("../../lib/render-document.js");
const { readDocumentLines } = await import("../../lib/docx-text.js");
const { offerTemplateSchema } = await import("../../schemas/templates/offer.template.schema.js");

/**
 * Hält fest, was `assets/templates/offer.docx` aus den Fixture-Daten macht.
 *
 * Ändert jemand die Vorlage, zeigt der Snapshot-Diff genau, was sich im
 * Dokument ändert — auch die Unterschiede zwischen den Zweigen mit und ohne
 * Vergleich. Nach gewollten Änderungen: `vitest -u`.
 */
async function renderLines(options: { featureComparison: boolean }) {
    const data = offerTemplateSchema.parse(await formatOfferData(offerFixture(options)));
    const rendered = await renderDocument("OFFER", "DE", data, { documentType: "offer", documentId: "doc-1" });
    return readDocumentLines(rendered.docxBuffer).join("\n");
}

describe("offer.docx", () => {
    beforeEach(() => {
        calculatePrice.mockReset().mockImplementation(async ({ contractId }: { contractId: string }) =>
            contractId === "c-broken" ? { ok: false } : { ok: true, breakdown: { unitPrice: 700 } });
    });

    it("mit Vergleich", async () => {
        expect(await renderLines({ featureComparison: true })).toMatchSnapshot();
    });

    it("ohne Vergleich", async () => {
        expect(await renderLines({ featureComparison: false })).toMatchSnapshot();
    });
});
