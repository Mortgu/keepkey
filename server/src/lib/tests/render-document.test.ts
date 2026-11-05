import fs from "fs";
import path from "path";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {z} from "zod";
import {renderDocument} from "../render-document.js";

const {warn} = vi.hoisted(() => ({warn: vi.fn()}));

vi.mock("../services/document-template.service.js", () => ({
    loadTemplateForRendering: vi.fn(async () =>
        fs.readFileSync(path.resolve(__dirname, "../../assets/templates/offer.docx"))),
}));
vi.mock("./docx-to-pdf.js", () => ({
    convertDocxToPdf: vi.fn(async () => Buffer.from("%PDF-fake")),
}));
vi.mock("@/utils/logger.js", () => ({default: {warn, info: vi.fn(), error: vi.fn()}}));

describe("renderDocument", () => {
    beforeEach(() => warn.mockClear());

    it("liefert DOCX und PDF", async () => {
        const rendered = await renderDocument("OFFER", "DE", {
            quoteId: "AG-1",
            customer: {companyName: "ACME"}
        });

        expect(rendered.docxBuffer.length).toBeGreaterThan(0);
        expect(rendered.pdfBuffer.toString()).toBe("%PDF-fake");
    });

    it("meldet Vorlagen-Platzhalter, die das Schema nicht kennt, ohne zu scheitern", async () => {
        const schema = z.object({quoteId: z.string()});

        const rendered = await renderDocument("OFFER", "DE", {quoteId: "AG-1"}, {schema});

        expect(rendered.docxBuffer.length).toBeGreaterThan(0);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining("not covered by schema"));
    });
});
