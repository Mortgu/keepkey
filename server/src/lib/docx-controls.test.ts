import PizZip from "pizzip";
import { describe, expect, it } from "vitest";
import { readContentControls } from "./docx-controls.js";

const W = `xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"`;

const sdt = (tag: string | null, content: string, extraProps = "") =>
    `<w:sdt><w:sdtPr>${tag ? `<w:tag w:val="${tag}"/>` : ""}${extraProps}</w:sdtPr>`
    + `<w:sdtContent>${content}</w:sdtContent></w:sdt>`;
const run = (text: string) => `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${text}</w:t></w:r>`;
const para = (inner: string) => `<w:p><w:pPr><w:tabs><w:tab w:val="left" w:pos="100"/></w:tabs></w:pPr>${inner}</w:p>`;

const docx = (body: string, extraParts: Record<string, string> = {}) => {
    const zip = new PizZip();
    zip.file("word/document.xml", `<?xml version="1.0"?><w:document ${W}><w:body>${body}</w:body></w:document>`);
    for (const [path, xml] of Object.entries(extraParts)) {
        zip.file(path, `<?xml version="1.0"?><w:ftr ${W}>${xml}</w:ftr>`);
    }
    return zip.generate({ type: "nodebuffer" });
};

describe("readContentControls", () => {
    it("liest den Text eines Controls über mehrere Runs", () => {
        const controls = readContentControls(docx(
            para(sdt("paymentTerm", `${run("30 ")}${run("Tage")}`)),
        ));

        expect(controls.get("paymentTerm")).toEqual(["30 Tage"]);
    });

    it("ignoriert Controls ohne Tag", () => {
        const controls = readContentControls(docx(para(sdt(null, run("x")))));

        expect(controls.size).toBe(0);
    });

    it("behandelt Platzhaltertext als leer", () => {
        const controls = readContentControls(docx(
            para(sdt("paymentTerm", run("Klicken Sie, um Text einzugeben"), "<w:showingPlcHdr/>")),
        ));

        expect(controls.get("paymentTerm")).toEqual([""]);
    });

    it("sammelt mehrere Fundstellen, auch in Fußzeilen", () => {
        const controls = readContentControls(docx(
            para(sdt("validUntil", run("01.01.2027"))),
            { "word/footer1.xml": para(sdt("validUntil", run("01.02.2027"))) },
        ));

        expect(controls.get("validUntil")).toEqual(["01.01.2027", "01.02.2027"]);
    });

    it("liest verschachtelte Controls getrennt", () => {
        const controls = readContentControls(docx(
            para(sdt("outer", `${run("a ")}${sdt("inner", run("b"))}`)),
        ));

        expect(controls.get("inner")).toEqual(["b"]);
        expect(controls.get("outer")).toEqual(["a b"]);
    });

    it("trennt Absätze und zählt Tabs aus Absatzeigenschaften nicht als Text", () => {
        const controls = readContentControls(docx(
            sdt("note", `${para(run("eins"))}${para(run("zwei"))}`),
        ));

        expect(controls.get("note")).toEqual(["eins\nzwei"]);
    });

    it("liest Entitäten", () => {
        const controls = readContentControls(docx(para(sdt("t", run("A &amp; B")))));

        expect(controls.get("t")).toEqual(["A & B"]);
    });

    it("liefert nichts für ein Dokument ohne Controls", () => {
        expect(readContentControls(docx(para(run("nur Text")))).size).toBe(0);
    });
});
