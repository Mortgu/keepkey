import PizZip from "pizzip";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashModel, writeProvenance } from "../../lib/docx-provenance.js";

const readModel = vi.fn();
const findWithArtifacts = vi.fn();
const getDocumentArtifact = vi.fn();
const offerDocumentFindUnique = vi.fn();
const offerDocumentFindUniqueOrThrow = vi.fn();
const offerDocumentUpdate = vi.fn();
const offerFindUniqueOrThrow = vi.fn();
const offerUpdate = vi.fn();
const assertOfferEditable = vi.fn();

const document = {
    id: "doc-1",
    status: "GENERATED",
    artifacts: [
        { id: "a-pdf", format: "PDF", objectKey: "old.pdf" },
        { id: "a-docx", format: "DOCX", objectKey: "old.docx" },
    ],
};

vi.mock("../../lib/prismaClient.js", () => {
    const tx = {
        $queryRaw: vi.fn(),
        document: {
            findUnique: (...args: unknown[]) => offerDocumentFindUnique(...args),
            findUniqueOrThrow: (...args: unknown[]) => offerDocumentFindUniqueOrThrow(...args),
            update: (...args: unknown[]) => offerDocumentUpdate(...args),
        },
        offer: {
            findUniqueOrThrow: (...args: unknown[]) => offerFindUniqueOrThrow(...args),
            update: (...args: unknown[]) => offerUpdate(...args),
        },
    };
    return {
        prisma: {
            $transaction: (callback: (client: typeof tx) => unknown) => callback(tx),
        },
    };
});
vi.mock("../offer-acceptance.service.js", () => ({
    assertOfferEditable: (...args: unknown[]) => assertOfferEditable(...args),
}));
vi.mock("../document-repo.js", () => ({
    documentTable: () => ({
        scope: "offers",
        findWithArtifacts: (...args: unknown[]) => findWithArtifacts(...args),
        requireWithArtifacts: (...args: unknown[]) => findWithArtifacts(...args),
        readModel: (...args: unknown[]) => readModel(...args),
    }),
}));
vi.mock("../../lib/document-artifact-store.js", () => ({
    getDocumentArtifact: (...args: unknown[]) => getDocumentArtifact(...args),
}));

const { adoptChanges } = await import("./adopt-document-changes.js");

const model = { paymentTerm: "30 Tage" };

function offerDocx(options: { text?: string; tag?: string } = {}) {
    const { text = "30 Tage", tag = "paymentTerm" } = options;
    const zip = new PizZip();
    zip.file("word/document.xml",
        `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p>`
        + `<w:sdt><w:sdtPr><w:tag w:val="${tag}"/></w:sdtPr><w:sdtContent><w:r><w:t>${text}</w:t></w:r>`
        + `</w:sdtContent></w:sdt></w:p></w:body></w:document>`);
    zip.file("docProps/custom.xml",
        `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties"`
        + ` xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"></Properties>`);
    writeProvenance(zip, { documentType: "offer", documentId: "doc-1", modelHash: hashModel(model) });
    return zip.generate({ type: "nodebuffer" });
}

describe("adoptChanges", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        readModel.mockResolvedValue(model);
        findWithArtifacts.mockResolvedValue(document);
        getDocumentArtifact.mockResolvedValue(offerDocx({ text: "14 Tage" }));
        offerDocumentFindUnique.mockResolvedValue({ offerId: "offer-1" });
        offerDocumentFindUniqueOrThrow.mockResolvedValue({ isCurrent: true, sourceVersion: 4 });
        offerDocumentUpdate.mockResolvedValue(undefined);
        offerFindUniqueOrThrow.mockResolvedValue({ version: 4 });
        offerUpdate.mockResolvedValue({ version: 5 });
        // `vi.clearAllMocks()` only clears call history, not an implementation
        // set via `mockRejectedValue`/`mockResolvedValue` — reset explicitly so
        // one test's override can't leak into the next.
        assertOfferEditable.mockResolvedValue(undefined);
    });

    it("schreibt den Wert ins Angebot, erhöht die Version und hält das Dokument aktuell", async () => {
        const result = await adoptChanges("offer", "doc-1", ["paymentTerm"]);

        expect(result).toEqual({ adopted: ["paymentTerm"] });
        expect(offerUpdate).toHaveBeenCalledWith({
            where: { id: "offer-1" },
            data: { paymentTerm: "14 Tage", version: { increment: 1 } },
            select: { version: true },
        });
        // Das Dokument gehört danach zur neuen Version und behält seinen Status.
        expect(offerDocumentUpdate).toHaveBeenCalledWith({
            where: { id: "doc-1", type: "OFFER" },
            data: { model: { paymentTerm: "14 Tage" }, sourceVersion: 5 },
        });
        expect(offerDocumentFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "doc-1", type: "OFFER" } }));
        expect(offerDocumentFindUniqueOrThrow).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "doc-1", type: "OFFER" } }));
        expect(assertOfferEditable).toHaveBeenCalledWith(expect.anything(), "offer-1");
    });

    it("liest ein Datum aus dem Dokument und speichert den Tag um Mitternacht UTC", async () => {
        readModel.mockResolvedValue({ validUntil: "01. November 2026" });
        getDocumentArtifact.mockResolvedValue(offerDocx({ text: "15. Dezember 2026", tag: "validUntil" }));

        await adoptChanges("offer", "doc-1", ["validUntil"]);

        expect(offerUpdate.mock.calls[0][0].data.validUntil).toEqual(new Date("2026-12-15T00:00:00.000Z"));
        expect(offerDocumentUpdate.mock.calls[0][0].data.model).toEqual({ validUntil: "15. Dezember 2026" });
    });

    it("übergeht Felder, die nicht (mehr) abweichen, und schreibt dann nichts", async () => {
        expect(await adoptChanges("offer", "doc-1", ["unknown"])).toEqual({ adopted: [] });
        expect(offerUpdate).not.toHaveBeenCalled();
        expect(offerDocumentUpdate).not.toHaveBeenCalled();
    });

    it("lehnt Felder ohne Zuordnung ab, ohne etwas zu schreiben", async () => {
        readModel.mockResolvedValue({ customer: { firstName: "Anna" } });
        getDocumentArtifact.mockResolvedValue(offerDocx({ text: "Berta", tag: "customer.firstName" }));

        await expect(adoptChanges("offer", "doc-1", ["customer.firstName"]))
            .rejects.toMatchObject({ code: "FIELD_NOT_ADOPTABLE", statusCode: 422 });
        expect(offerUpdate).not.toHaveBeenCalled();
    });

    it("lehnt unlesbare Werte ab, ohne etwas zu schreiben", async () => {
        readModel.mockResolvedValue({ validUntil: "01. November 2026" });
        getDocumentArtifact.mockResolvedValue(offerDocx({ text: "irgendwann", tag: "validUntil" }));

        await expect(adoptChanges("offer", "doc-1", ["validUntil"]))
            .rejects.toMatchObject({ code: "FIELD_NOT_ADOPTABLE", statusCode: 422 });
        expect(offerUpdate).not.toHaveBeenCalled();
    });

    it("lehnt eine leere Zahlungsbedingung ab", async () => {
        getDocumentArtifact.mockResolvedValue(offerDocx({ text: " " }));

        await expect(adoptChanges("offer", "doc-1", ["paymentTerm"]))
            .rejects.toMatchObject({ code: "FIELD_NOT_ADOPTABLE" });
    });

    it("lehnt ab, wenn das Dokument nicht das aktuelle ist", async () => {
        offerDocumentFindUniqueOrThrow.mockResolvedValue({ isCurrent: false, sourceVersion: 4 });

        await expect(adoptChanges("offer", "doc-1", ["paymentTerm"]))
            .rejects.toMatchObject({ code: "DOCUMENT_NOT_CURRENT", statusCode: 409 });
        expect(offerUpdate).not.toHaveBeenCalled();
    });

    it("lehnt ab, wenn das Angebot seit dem Erzeugen geändert wurde", async () => {
        offerFindUniqueOrThrow.mockResolvedValue({ version: 6 });

        await expect(adoptChanges("offer", "doc-1", ["paymentTerm"]))
            .rejects.toMatchObject({ code: "DOCUMENT_NOT_CURRENT", statusCode: 409 });
        expect(offerUpdate).not.toHaveBeenCalled();
    });

    it("lehnt ab, wenn das Angebot angenommen ist", async () => {
        assertOfferEditable.mockRejectedValue(Object.assign(new Error("accepted"), { code: "OFFER_ACCEPTED" }));

        await expect(adoptChanges("offer", "doc-1", ["paymentTerm"])).rejects.toMatchObject({ code: "OFFER_ACCEPTED" });
        expect(offerUpdate).not.toHaveBeenCalled();
    });

    it("lehnt ab, wenn kein Modell gespeichert ist", async () => {
        readModel.mockResolvedValue(null);

        await expect(adoptChanges("offer", "doc-1", ["paymentTerm"]))
            .rejects.toMatchObject({ code: "MODEL_UNAVAILABLE", statusCode: 409 });
    });

    it("lehnt ab, wenn die Datei zwischenzeitlich ersetzt wurde", async () => {
        findWithArtifacts
            .mockResolvedValueOnce(document)
            .mockResolvedValueOnce({
                ...document,
                artifacts: [document.artifacts[0], { id: "a-docx", format: "DOCX", objectKey: "newer.docx" }],
            });

        await expect(adoptChanges("offer", "doc-1", ["paymentTerm"]))
            .rejects.toMatchObject({ code: "DOCUMENT_STATE_CHANGED", statusCode: 409 });
        expect(offerUpdate).not.toHaveBeenCalled();
    });

    it("kennt für andere Dokumenttypen keine Übernahme", async () => {
        await expect(adoptChanges("order", "doc-1", ["paymentTerm"]))
            .rejects.toMatchObject({ code: "ADOPTION_NOT_SUPPORTED", statusCode: 422 });
        await expect(adoptChanges("invoice", "doc-1", ["paymentTerm"]))
            .rejects.toMatchObject({ code: "ADOPTION_NOT_SUPPORTED" });
    });
});
