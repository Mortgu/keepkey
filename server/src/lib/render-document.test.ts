import fs from "fs";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const { warn } = vi.hoisted(() => ({ warn: vi.fn() }));

vi.mock("../services/document-template.service.js", () => ({
    loadTemplateForRendering: vi.fn(async () =>
        fs.readFileSync(path.resolve(__dirname, "../../assets/templates/offer.docx"))),
}));
vi.mock("./docx-to-pdf.js", () => ({
    convertDocxToPdf: vi.fn(async () => Buffer.from("%PDF-fake")),
}));
vi.mock("@/utils/logger.js", () => ({ default: { warn, info: vi.fn(), error: vi.fn() } }));

import { hashModel, readProvenance } from "./docx-provenance.js";
import { renderDocument } from "./render-document.js";

const provenance = { documentType: "offer", documentId: "doc_1" };

describe("renderDocument", () => {
    beforeEach(() => warn.mockClear());

    it("bettet Herkunft und Modell-Hash in die DOCX ein", async () => {
        const rendered = await renderDocument("OFFER", "DE", { quoteId: "AG-1", customer: { companyName: "ACME" } }, provenance);

        expect(readProvenance(rendered.docxBuffer)).toEqual({ ...provenance, modelHash: rendered.modelHash });
        expect(rendered.modelHash).toBe(hashModel(rendered.model));
        expect(rendered.pdfBuffer.toString()).toBe("%PDF-fake");
    });

    it("liefert ein JSON-sicheres Modell mit aufgelösten Platzhaltern", async () => {
        const rendered = await renderDocument("OFFER", "DE", {
            quoteId: "AG-1",
            note: "Angebot {quoteId}",
            createdAt: new Date("2026-10-11T10:00:00.000Z"),
        }, provenance);

        expect(rendered.model).toEqual({
            quoteId: "AG-1",
            note: "Angebot AG-1",
            createdAt: "2026-10-11T10:00:00.000Z",
        });
    });

    it("meldet Vorlagen-Platzhalter, die das Schema nicht kennt, ohne zu scheitern", async () => {
        const schema = z.object({ quoteId: z.string() });

        const rendered = await renderDocument("OFFER", "DE", { quoteId: "AG-1" }, provenance, { schema });

        expect(readProvenance(rendered.docxBuffer)).not.toBeNull();
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("not covered by schema"));
    });

    it("ergibt für gleiche Daten denselben Hash", async () => {
        const a = await renderDocument("OFFER", "DE", { quoteId: "AG-1", n: 1 }, provenance);
        const b = await renderDocument("OFFER", "DE", { n: 1, quoteId: "AG-1" }, provenance);

        expect(a.modelHash).toBe(b.modelHash);
    });
});
