import PizZip from "pizzip";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashModel, writeProvenance } from "../lib/docx-provenance.js";

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

vi.mock("../lib/prismaClient.js", () => {
    const tx = {
        $queryRaw: vi.fn(),
        documentArtifact: { update: vi.fn() },
        offerDocument: {
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
            offerDocument: { findUnique: (...args: unknown[]) => offerDocumentFindUnique(...args) },
        },
    };
});
vi.mock("./offer-acceptance.service.js", () => ({
    assertOfferEditable: (...args: unknown[]) => assertOfferEditable(...args),
}));
vi.mock("./document-repo.js", () => ({
    documentTable: () => ({
        scope: "confirmations",
        findWithArtifacts: (...args: unknown[]) => findWithArtifacts(...args),
        readModel: (...args: unknown[]) => readModel(...args),
    }),
}));
vi.mock("../lib/document-artifact-store.js", () => ({
    browserEndpointIssue: vi.fn(),
    bucketAllowsBrowserUploads: vi.fn(),
    getDocumentArtifact: (...args: unknown[]) => getDocumentArtifact(...args),
    getDocumentDownloadUrl: vi.fn(),
    getDocumentUploadUrl: vi.fn(),
    isS3Available: vi.fn(),
    removeDocumentArtifact: vi.fn(async () => undefined),
    removeDocumentArtifacts: vi.fn(),
    storeObject: vi.fn(async (objectKey: string) => ({ objectKey, size: 1, sha256: "pdf-hash" })),
}));
vi.mock("../lib/docx.js", () => ({ assertDocxBuffer: vi.fn() }));
vi.mock("../lib/docx-to-pdf.js", () => ({ convertDocxToPdf: vi.fn(async () => Buffer.from("%PDF")) }));
vi.mock("../lib/nextcloud-document-store.js", () => ({
    RemoteDocumentExistsError: class extends Error {},
    deleteDocumentArtifact: vi.fn(),
    moveDocumentArtifact: vi.fn(),
    sha256Document: () => "docx-hash",
}));
vi.mock("./document-upload.service.js", () => ({ uploadGeneratedDocument: vi.fn() }));
vi.mock("@/utils/logger.js", () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

const { confirmReplacementUpload, adoptChanges } = await import("./documents.service.js");

const model = { paymentTerm: "30 Tage" };
const KEY = "replaced/confirmations/doc-1/upload.docx";

function uploadedDocx(options: {
    text?: string; documentId?: string; provenance?: boolean; tag?: string; documentType?: string;
} = {}) {
    const { text = "30 Tage", documentId = "doc-1", provenance = true, tag = "paymentTerm", documentType = "confirmation" } = options;
    const zip = new PizZip();
    zip.file("word/document.xml",
        `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p>`
        + `<w:sdt><w:sdtPr><w:tag w:val="${tag}"/></w:sdtPr><w:sdtContent><w:r><w:t>${text}</w:t></w:r>`
        + `</w:sdtContent></w:sdt></w:p></w:body></w:document>`);
    zip.file("docProps/custom.xml",
        `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties"`
        + ` xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"></Properties>`);
    if (provenance) {
        writeProvenance(zip, { documentType, documentId, modelHash: hashModel(model) });
    }
    return zip.generate({ type: "nodebuffer" });
}

describe("confirmReplacementUpload warnings", () => {
    beforeEach(() => {
        readModel.mockReset().mockResolvedValue(model);
        findWithArtifacts.mockReset().mockResolvedValue(document);
        getDocumentArtifact.mockReset();
    });

    it("liefert keine Hinweise, wenn die Datei zum Modell passt", async () => {
        getDocumentArtifact.mockResolvedValue(uploadedDocx());

        const result = await confirmReplacementUpload("confirmation", "doc-1", "docx", KEY);

        expect(result).toMatchObject({ id: "doc-1", warnings: [] });
    });

    it("meldet ein geändertes Feld und übernimmt die Datei trotzdem", async () => {
        getDocumentArtifact.mockResolvedValue(uploadedDocx({ text: "14 Tage" }));

        const result = await confirmReplacementUpload("confirmation", "doc-1", "docx", KEY);

        expect(result.warnings).toEqual([
            { code: "FIELD_CHANGED", field: "paymentTerm", expected: "30 Tage", actual: "14 Tage", adoptable: false },
        ]);
    });

    it("meldet eine Datei, die zu einem anderen Dokument gehört", async () => {
        getDocumentArtifact.mockResolvedValue(uploadedDocx({ documentId: "other" }));

        const result = await confirmReplacementUpload("confirmation", "doc-1", "docx", KEY);

        expect(result.warnings).toEqual([{ code: "DOCUMENT_MISMATCH", expected: "doc-1", found: "other" }]);
    });

    it("behandelt Dateien ohne Herkunft still, vergleicht aber die Felder", async () => {
        getDocumentArtifact.mockResolvedValue(uploadedDocx({ provenance: false, text: "14 Tage" }));

        const result = await confirmReplacementUpload("confirmation", "doc-1", "docx", KEY);

        expect(result.warnings).toEqual([
            { code: "FIELD_CHANGED", field: "paymentTerm", expected: "30 Tage", actual: "14 Tage", adoptable: false },
        ]);
    });

    it("schweigt bei Dokumenten ohne gespeichertes Modell", async () => {
        readModel.mockResolvedValue(null);
        getDocumentArtifact.mockResolvedValue(uploadedDocx({ text: "14 Tage" }));

        const result = await confirmReplacementUpload("confirmation", "doc-1", "docx", KEY);

        expect(result.warnings).toEqual([]);
    });

    it("lässt den Upload gelingen, wenn die Prüfung selbst scheitert", async () => {
        readModel.mockRejectedValue(new Error("db down"));
        getDocumentArtifact.mockResolvedValue(uploadedDocx());

        const result = await confirmReplacementUpload("confirmation", "doc-1", "docx", KEY);

        expect(result).toMatchObject({ id: "doc-1", warnings: [] });
    });
});

const offerDocx = (options: Parameters<typeof uploadedDocx>[0] = {}) => uploadedDocx({ documentType: "offer", ...options });

describe("confirmReplacementUpload bei Angeboten", () => {
    const offerState = (overrides: Record<string, unknown> = {}) => ({
        isCurrent: true,
        sourceVersion: 4,
        offer: { version: 4, acceptedAt: null },
        ...overrides,
    });

    beforeEach(() => {
        readModel.mockReset().mockResolvedValue(model);
        findWithArtifacts.mockReset().mockResolvedValue(document);
        getDocumentArtifact.mockReset().mockResolvedValue(offerDocx({ text: "14 Tage" }));
        offerDocumentFindUnique.mockReset().mockResolvedValue(offerState());
    });

    const replace = () => confirmReplacementUpload("offer", "doc-1", "docx", KEY);
    const warning = (field: string) => ({ code: "FIELD_CHANGED", field, expected: "30 Tage", actual: "14 Tage" });

    it("markiert zuordenbare Felder am aktuellen Dokument als übernehmbar", async () => {
        expect((await replace()).warnings).toEqual([{ ...warning("paymentTerm"), adoptable: true }]);
    });

    it("markiert nichts als übernehmbar, wenn das Angebot seither geändert wurde", async () => {
        offerDocumentFindUnique.mockResolvedValue(offerState({ offer: { version: 5, acceptedAt: null } }));

        expect((await replace()).warnings).toEqual([{ ...warning("paymentTerm"), adoptable: false }]);
    });

    it("markiert Felder ohne Zuordnung als nicht übernehmbar", async () => {
        readModel.mockResolvedValue({ customer: { firstName: "Anna" } });
        getDocumentArtifact.mockResolvedValue(offerDocx({ text: "Berta", tag: "customer.firstName" }));

        const [result] = (await replace()).warnings;

        expect(result).toMatchObject({ field: "customer.firstName", adoptable: false });
    });

    it("markiert unlesbare Werte als nicht übernehmbar", async () => {
        readModel.mockResolvedValue({ validUntil: "01. November 2026" });
        getDocumentArtifact.mockResolvedValue(offerDocx({ text: "irgendwann", tag: "validUntil" }));

        expect((await replace()).warnings).toMatchObject([{ field: "validUntil", adoptable: false }]);
    });
});

describe("adoptChanges", () => {
    beforeEach(() => {
        readModel.mockReset().mockResolvedValue(model);
        findWithArtifacts.mockReset().mockResolvedValue(document);
        getDocumentArtifact.mockReset().mockResolvedValue(offerDocx({ text: "14 Tage" }));
        assertOfferEditable.mockReset();
        offerDocumentFindUnique.mockReset().mockResolvedValue({ offerId: "offer-1" });
        offerDocumentFindUniqueOrThrow.mockReset().mockResolvedValue({ isCurrent: true, sourceVersion: 4 });
        offerDocumentUpdate.mockReset();
        offerFindUniqueOrThrow.mockReset().mockResolvedValue({ version: 4 });
        offerUpdate.mockReset().mockResolvedValue({ version: 5 });
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
            where: { id: "doc-1" },
            data: { model: { paymentTerm: "14 Tage" }, sourceVersion: 5 },
        });
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
