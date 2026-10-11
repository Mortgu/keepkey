import PizZip from "pizzip";
import { describe, expect, it } from "vitest";
import { hashModel, readProvenance, writeProvenance } from "./docx-provenance.js";

const customProps = (properties = "") =>
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`
    + `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties"`
    + ` xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">${properties}</Properties>`;

const docx = (custom: string | null = customProps()) => {
    const zip = new PizZip();
    zip.file("word/document.xml", "<w:document/>");
    if (custom !== null) zip.file("docProps/custom.xml", custom);
    return zip;
};

const provenance = { documentType: "offer", documentId: "cl_1", modelHash: "abc" };

describe("docx provenance", () => {
    it("liest zurück, was geschrieben wurde", () => {
        const zip = docx();
        writeProvenance(zip, provenance);

        expect(readProvenance(zip.generate({ type: "nodebuffer" }))).toEqual(provenance);
    });

    it("ersetzt eine frühere Herkunft und behält fremde Eigenschaften", () => {
        const zip = docx(customProps(
            `<property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="2" name="Author"><vt:lpwstr>Anna</vt:lpwstr></property>`,
        ));
        writeProvenance(zip, { ...provenance, documentId: "old" });
        writeProvenance(zip, provenance);

        const xml = zip.file("docProps/custom.xml")!.asText();
        expect(xml.match(/name="keepit\.documentId"/g)).toHaveLength(1);
        expect(xml).toContain(`name="Author"`);
        expect(readProvenance(zip.generate({ type: "nodebuffer" }))).toEqual(provenance);
    });

    it("vergibt eindeutige pids", () => {
        const zip = docx();
        writeProvenance(zip, provenance);

        const pids = zip.file("docProps/custom.xml")!.asText().match(/pid="(\d+)"/g);
        expect(new Set(pids).size).toBe(pids!.length);
    });

    it("escaped Sonderzeichen", () => {
        const zip = docx();
        writeProvenance(zip, { ...provenance, documentId: `a&b<"c">` });

        expect(readProvenance(zip.generate({ type: "nodebuffer" }))?.documentId).toBe(`a&b<"c">`);
    });

    it("liefert null ohne Herkunft oder ohne Eigenschaftenteil", () => {
        expect(readProvenance(docx().generate({ type: "nodebuffer" }))).toBeNull();
        expect(readProvenance(docx(null).generate({ type: "nodebuffer" }))).toBeNull();
    });

    it("schreibt nicht in ein DOCX ohne Eigenschaftenteil", () => {
        expect(() => writeProvenance(docx(null), provenance)).toThrow(/custom\.xml/);
    });
});

describe("hashModel", () => {
    it("ist unabhängig von der Schlüsselreihenfolge", () => {
        expect(hashModel({ a: 1, b: { c: [1, 2], d: null } }))
            .toBe(hashModel({ b: { d: null, c: [1, 2] }, a: 1 }));
    });

    it("unterscheidet verschiedene Inhalte", () => {
        expect(hashModel({ a: 1 })).not.toBe(hashModel({ a: 2 }));
        expect(hashModel({ a: [1, 2] })).not.toBe(hashModel({ a: [2, 1] }));
    });
});
