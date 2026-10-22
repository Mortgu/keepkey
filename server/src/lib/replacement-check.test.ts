import PizZip from "pizzip";
import { describe, expect, it } from "vitest";
import { hashModel, writeProvenance } from "./docx-provenance.js";
import { checkReplacement, diffControls, withAdoptedValue } from "./replacement-check.js";

const W = `xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"`;
const control = (tag: string, text: string) =>
    `<w:p><w:sdt><w:sdtPr><w:tag w:val="${tag}"/></w:sdtPr><w:sdtContent>`
    + `<w:r><w:t>${text}</w:t></w:r></w:sdtContent></w:sdt></w:p>`;

const model = { paymentTerm: "30 Tage", customer: { firstName: "Anna" }, count: 3, note: null, items: [1] };

function docx(controls: Array<[string, string]>, provenance: { documentId?: string; modelHash?: string } | null) {
    const zip = new PizZip();
    zip.file("word/document.xml",
        `<w:document ${W}><w:body>${controls.map(([t, v]) => control(t, v)).join("")}</w:body></w:document>`);
    zip.file("docProps/custom.xml",
        `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties"`
        + ` xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"></Properties>`);
    if (provenance) {
        writeProvenance(zip, {
            documentType: "offer",
            documentId: provenance.documentId ?? "doc_1",
            modelHash: provenance.modelHash ?? hashModel(model),
        });
    }
    return zip.generate({ type: "nodebuffer" });
}

const check = (file: Buffer, overrides: Partial<{ model: unknown; documentId: string }> = {}) =>
    checkReplacement({ documentType: "offer", documentId: "doc_1", model, docx: file, ...overrides });

describe("checkReplacement", () => {
    it("meldet nichts, wenn Controls dem Modell entsprechen", () => {
        expect(check(docx([["paymentTerm", "30 Tage"], ["customer.firstName", "Anna"]], {}))).toEqual([]);
    });

    it("ignoriert Unterschiede in Leerraum", () => {
        expect(check(docx([["paymentTerm", "  30   Tage "]], {}))).toEqual([]);
    });

    it("meldet geänderte Felder", () => {
        expect(check(docx([["paymentTerm", "14 Tage"]], {}))).toEqual([
            { code: "FIELD_CHANGED", field: "paymentTerm", expected: "30 Tage", actual: "14 Tage" },
        ]);
    });

    it("vergleicht Zahlen und null als Text", () => {
        expect(check(docx([["count", "3"], ["note", ""]], {}))).toEqual([]);
        expect(check(docx([["count", "4"]], {}))).toHaveLength(1);
    });

    it("meldet, wenn eine von mehreren Fundstellen abweicht", () => {
        const warnings = check(docx([["paymentTerm", "30 Tage"], ["paymentTerm", "60 Tage"]], {}));

        expect(warnings).toEqual([
            { code: "FIELD_CHANGED", field: "paymentTerm", expected: "30 Tage", actual: "60 Tage" },
        ]);
    });

    it("überspringt Tags, die das Modell nicht kennt oder die keine Skalare sind", () => {
        expect(check(docx([["unknown", "x"], ["items", "y"], ["customer", "z"]], {}))).toEqual([]);
    });

    it("warnt bei fremdem Dokument und vergleicht dann keine Felder", () => {
        expect(check(docx([["paymentTerm", "14 Tage"]], { documentId: "other" }))).toEqual([
            { code: "DOCUMENT_MISMATCH", expected: "doc_1", found: "other" },
        ]);
    });

    it("vergleicht Felder unabhängig vom Hash der Herkunft", () => {
        // Nach dem Übernehmen von Änderungen weicht das Modell vom ursprünglichen Hash ab.
        expect(check(docx([["paymentTerm", "30 Tage"]], { modelHash: "old" }))).toEqual([]);
    });

    it("vergleicht Felder auch ohne Herkunft und vermerkt sie", () => {
        expect(check(docx([["paymentTerm", "14 Tage"]], null))).toEqual([
            { code: "PROVENANCE_MISSING" },
            { code: "FIELD_CHANGED", field: "paymentTerm", expected: "30 Tage", actual: "14 Tage" },
        ]);
    });

    it("meldet fehlendes Modell", () => {
        expect(check(docx([], {}), { model: null })).toEqual([{ code: "MODEL_UNAVAILABLE" }]);
    });
});

describe("diffControls", () => {
    it("liefert nur die abweichenden Felder", () => {
        const changes = diffControls(model, docx([["paymentTerm", "14 Tage"], ["customer.firstName", "Anna"]], {}));

        expect(changes).toEqual([{ field: "paymentTerm", expected: "30 Tage", actual: "14 Tage" }]);
    });
});

describe("withAdoptedValue", () => {
    it("setzt Text und lässt das Original unverändert", () => {
        const next = withAdoptedValue(model, "paymentTerm", " 14 Tage ");

        expect(next).toMatchObject({ paymentTerm: "14 Tage", customer: { firstName: "Anna" }, count: 3 });
        expect(model.paymentTerm).toBe("30 Tage");
    });

    it("erreicht verschachtelte Felder und setzt null auf Text", () => {
        expect(withAdoptedValue(model, "customer.firstName", "Berta")).toMatchObject({ customer: { firstName: "Berta" } });
        expect(withAdoptedValue(model, "note", "neu")).toMatchObject({ note: "neu" });
    });

    it("bewahrt Zahlen als Zahlen und lehnt Unlesbares ab", () => {
        expect(withAdoptedValue(model, "count", "7")).toMatchObject({ count: 7 });
        expect(withAdoptedValue(model, "count", "sieben")).toBeNull();
        expect(withAdoptedValue(model, "count", " ")).toBeNull();
    });

    it("lehnt unbekannte Pfade und Nicht-Skalare ab", () => {
        expect(withAdoptedValue(model, "missing", "x")).toBeNull();
        expect(withAdoptedValue(model, "customer.lastName", "x")).toBeNull();
        expect(withAdoptedValue(model, "items", "x")).toBeNull();
        expect(withAdoptedValue(model, "paymentTerm.deeper", "x")).toBeNull();
    });
});
