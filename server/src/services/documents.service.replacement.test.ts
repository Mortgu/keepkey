import PizZip from "pizzip";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashModel, writeProvenance } from "../lib/docx-provenance.js";

const readModel = vi.fn();
const writeModel = vi.fn();
const findWithArtifacts = vi.fn();
const getDocumentArtifact = vi.fn();

const document = {
    id: "doc-1",
    status: "GENERATED",
    artifacts: [
        { id: "a-pdf", format: "PDF", objectKey: "old.pdf" },
        { id: "a-docx", format: "DOCX", objectKey: "old.docx" },
    ],
};

vi.mock("../lib/prismaClient.js", () => {
    const tx = { $queryRaw: vi.fn(), documentArtifact: { update: vi.fn() } };
    return { prisma: { $transaction: (callback: (client: typeof tx) => unknown) => callback(tx) } };
});
vi.mock("./document-repo.js", () => ({
    documentTable: () => ({
        scope: "confirmations",
        findWithArtifacts: (...args: unknown[]) => findWithArtifacts(...args),
        readModel: (...args: unknown[]) => readModel(...args),
        writeModel: (...args: unknown[]) => writeModel(...args),
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

const { confirmReplacementUpload, adoptModelChanges } = await import("./documents.service.js");

const model = { paymentTerm: "30 Tage" };
const KEY = "replaced/confirmations/doc-1/upload.docx";

function uploadedDocx(options: { text?: string; documentId?: string; provenance?: boolean } = {}) {
    const { text = "30 Tage", documentId = "doc-1", provenance = true } = options;
    const zip = new PizZip();
    zip.file("word/document.xml",
        `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p>`
        + `<w:sdt><w:sdtPr><w:tag w:val="paymentTerm"/></w:sdtPr><w:sdtContent><w:r><w:t>${text}</w:t></w:r>`
        + `</w:sdtContent></w:sdt></w:p></w:body></w:document>`);
    zip.file("docProps/custom.xml",
        `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties"`
        + ` xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"></Properties>`);
    if (provenance) {
        writeProvenance(zip, { documentType: "confirmation", documentId, modelHash: hashModel(model) });
    }
    return zip.generate({ type: "nodebuffer" });
}

describe("confirmReplacementUpload warnings", () => {
    beforeEach(() => {
        readModel.mockReset().mockResolvedValue(model);
        writeModel.mockReset();
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
            { code: "FIELD_CHANGED", field: "paymentTerm", expected: "30 Tage", actual: "14 Tage" },
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
            { code: "FIELD_CHANGED", field: "paymentTerm", expected: "30 Tage", actual: "14 Tage" },
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

describe("adoptModelChanges", () => {
    beforeEach(() => {
        readModel.mockReset().mockResolvedValue(model);
        writeModel.mockReset();
        findWithArtifacts.mockReset().mockResolvedValue(document);
        getDocumentArtifact.mockReset().mockResolvedValue(uploadedDocx({ text: "14 Tage" }));
    });

    it("übernimmt den Wert aus der Datei ins Modell", async () => {
        const result = await adoptModelChanges("confirmation", "doc-1", ["paymentTerm"]);

        expect(result).toEqual({ adopted: ["paymentTerm"] });
        expect(writeModel).toHaveBeenCalledWith("doc-1", { paymentTerm: "14 Tage" });
    });

    it("übergeht Felder, die nicht (mehr) abweichen, und schreibt dann nichts", async () => {
        const result = await adoptModelChanges("confirmation", "doc-1", ["unknown", "paymentTerm", "paymentTerm"]);
        expect(result).toEqual({ adopted: ["paymentTerm"] });

        writeModel.mockClear();
        getDocumentArtifact.mockResolvedValue(uploadedDocx());
        expect(await adoptModelChanges("confirmation", "doc-1", ["paymentTerm"])).toEqual({ adopted: [] });
        expect(writeModel).not.toHaveBeenCalled();
    });

    it("lehnt ab, ohne etwas zu schreiben, wenn der Wert nicht zum Feldtyp passt", async () => {
        readModel.mockResolvedValue({ paymentTerm: 30 });

        await expect(adoptModelChanges("confirmation", "doc-1", ["paymentTerm"]))
            .rejects.toMatchObject({ code: "FIELD_NOT_ADOPTABLE", statusCode: 422 });
        expect(writeModel).not.toHaveBeenCalled();
    });

    it("lehnt ab, wenn kein Modell gespeichert ist", async () => {
        readModel.mockResolvedValue(null);

        await expect(adoptModelChanges("confirmation", "doc-1", ["paymentTerm"]))
            .rejects.toMatchObject({ code: "MODEL_UNAVAILABLE", statusCode: 409 });
    });

    it("lehnt ab, wenn die Datei zwischenzeitlich ersetzt wurde", async () => {
        findWithArtifacts
            .mockResolvedValueOnce(document)
            .mockResolvedValueOnce({
                ...document,
                artifacts: [document.artifacts[0], { id: "a-docx", format: "DOCX", objectKey: "newer.docx" }],
            });

        await expect(adoptModelChanges("confirmation", "doc-1", ["paymentTerm"]))
            .rejects.toMatchObject({ code: "DOCUMENT_STATE_CHANGED", statusCode: 409 });
        expect(writeModel).not.toHaveBeenCalled();
    });
});
