import PizZip from "pizzip";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { hashModel, writeProvenance } from "../../../lib/docx-provenance.js";
import { AppException } from "../../../lib/exceptions.js";

const readModel = vi.fn();
const findWithArtifacts = vi.fn();
const getDocumentArtifact = vi.fn();
const getDocumentUploadUrl = vi.fn();
const removeDocumentArtifact = vi.fn(async (..._args: unknown[]) => undefined);
const storeObject = vi.fn();
const browserEndpointIssue = vi.fn();
const isS3Available = vi.fn();
const bucketAllowsBrowserUploads = vi.fn();
const assertEditable = vi.fn();
const canAdopt = vi.fn();
const documentArtifactUpdate = vi.fn();

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
        documentArtifact: { update: (...args: unknown[]) => documentArtifactUpdate(...args) },
    };
    return {
        prisma: {
            $transaction: (callback: (client: typeof tx) => unknown) => callback(tx),
        },
    };
});
vi.mock("../document-repo.js", () => ({
    documentTable: () => ({
        scope: "confirmations",
        findWithArtifacts: (...args: unknown[]) => findWithArtifacts(...args),
        requireWithArtifacts: (...args: unknown[]) => findWithArtifacts(...args),
        readModel: (...args: unknown[]) => readModel(...args),
        assertEditable: (...args: unknown[]) => assertEditable(...args),
        canAdopt: (...args: unknown[]) => canAdopt(...args),
    }),
}));
vi.mock("../../lib/document-artifact-store.js", () => ({
    MIME_TYPES: { pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    toDocumentFormat: (format: string) => (format === "pdf" ? "PDF" : "DOCX"),
    browserEndpointIssue: (...args: unknown[]) => browserEndpointIssue(...args),
    bucketAllowsBrowserUploads: (...args: unknown[]) => bucketAllowsBrowserUploads(...args),
    getDocumentArtifact: (...args: unknown[]) => getDocumentArtifact(...args),
    getDocumentUploadUrl: (...args: unknown[]) => getDocumentUploadUrl(...args),
    isS3Available: (...args: unknown[]) => isS3Available(...args),
    removeDocumentArtifact: (...args: unknown[]) => removeDocumentArtifact(...args),
    storeObject: (...args: unknown[]) => storeObject(...args),
}));
vi.mock("../../lib/docx.js", () => ({ assertDocxBuffer: vi.fn() }));
vi.mock("../../lib/docx-to-pdf.js", () => ({ convertDocxToPdf: vi.fn(async () => Buffer.from("%PDF")) }));
vi.mock("../../lib/nextcloud-document-store.js", () => ({ sha256Document: () => "docx-hash" }));
vi.mock("@/utils/logger.js", () => ({ default: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));

const { confirmReplacementUpload, createReplacementUpload, getDocumentCapabilities } =
    await import("../document-replacement.js");

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

describe("offer document mutations once the offer is accepted", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        findWithArtifacts.mockResolvedValue({ ...document, status: "GENERATED" });
        assertEditable.mockRejectedValue(
            new AppException("Accepted offers' documents can no longer be changed.", 409, "OFFER_ACCEPTED"),
        );
    });

    it("createReplacementUpload is rejected", async () => {
        await expect(
            createReplacementUpload("offer", "doc-1", "docx"),
        ).rejects.toMatchObject({ code: "OFFER_ACCEPTED", statusCode: 409 });
    });
});

describe("confirmReplacementUpload warnings", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        readModel.mockResolvedValue(model);
        findWithArtifacts.mockResolvedValue(document);
        storeObject.mockImplementation(async (objectKey: string) => ({ objectKey, size: 1, sha256: "pdf-hash" }));
        assertEditable.mockResolvedValue(undefined);
        canAdopt.mockResolvedValue(false);
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
    beforeEach(() => {
        vi.clearAllMocks();
        readModel.mockResolvedValue(model);
        findWithArtifacts.mockResolvedValue(document);
        storeObject.mockImplementation(async (objectKey: string) => ({ objectKey, size: 1, sha256: "pdf-hash" }));
        getDocumentArtifact.mockResolvedValue(offerDocx({ text: "14 Tage" }));
        assertEditable.mockResolvedValue(undefined);
        // Übernahmefähigkeit selbst ist Sache von `canAdopt` (getestet
        // in document-repo.tests.ts) — hier zählt nur, dass ihr Ergebnis
        // korrekt ins `adoptable`-Flag durchgereicht wird.
        canAdopt.mockResolvedValue(true);
    });

    const replace = () => confirmReplacementUpload("offer", "doc-1", "docx", KEY);
    const warning = (field: string) => ({ code: "FIELD_CHANGED", field, expected: "30 Tage", actual: "14 Tage" });

    it("markiert zuordenbare Felder am aktuellen Dokument als übernehmbar", async () => {
        expect((await replace()).warnings).toEqual([{ ...warning("paymentTerm"), adoptable: true }]);
    });

    it("markiert nichts als übernehmbar, wenn das Dokument nicht übernahmefähig ist", async () => {
        canAdopt.mockResolvedValue(false);

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

describe("confirmReplacementUpload swaps the stored pair", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        readModel.mockResolvedValue(model);
        getDocumentArtifact.mockResolvedValue(uploadedDocx());
        storeObject.mockImplementation(async (objectKey: string) => ({ objectKey, size: 1, sha256: "pdf-hash" }));
        assertEditable.mockResolvedValue(undefined);
        canAdopt.mockResolvedValue(false);
    });

    it("swaps both artifacts to the new objects and discards the previous pair", async () => {
        findWithArtifacts.mockResolvedValue(document);

        const result = await confirmReplacementUpload("confirmation", "doc-1", "docx", KEY);

        expect(result.id).toBe("doc-1");
        const pdfKey = storeObject.mock.calls[0][0];
        expect(documentArtifactUpdate).toHaveBeenCalledWith({
            where: { id: "a-docx" },
            data: expect.objectContaining({ objectKey: KEY }),
        });
        expect(documentArtifactUpdate).toHaveBeenCalledWith({
            where: { id: "a-pdf" },
            data: expect.objectContaining({ objectKey: pdfKey }),
        });
        expect(removeDocumentArtifact).toHaveBeenCalledWith("old.pdf");
        expect(removeDocumentArtifact).toHaveBeenCalledWith("old.docx");
        expect(removeDocumentArtifact).not.toHaveBeenCalledWith(KEY);
        expect(removeDocumentArtifact).not.toHaveBeenCalledWith(pdfKey);
    });

    it("discards everything staged so far — once — when the transaction rejects", async () => {
        findWithArtifacts
            .mockResolvedValueOnce(document)
            .mockResolvedValueOnce({ ...document, status: "UPLOADING" });

        await expect(
            confirmReplacementUpload("confirmation", "doc-1", "docx", KEY),
        ).rejects.toMatchObject({ code: "DOCUMENT_STATE_CHANGED", statusCode: 409 });

        const pdfKey = storeObject.mock.calls[0][0];
        expect(removeDocumentArtifact).toHaveBeenCalledWith(KEY);
        expect(removeDocumentArtifact).toHaveBeenCalledWith(pdfKey);
        expect(removeDocumentArtifact).toHaveBeenCalledTimes(2);
        expect(documentArtifactUpdate).not.toHaveBeenCalled();
    });

    it("does not discard the newly committed objects if the post-commit re-fetch fails", async () => {
        findWithArtifacts
            .mockResolvedValueOnce(document) // requireReplaceableArtifact
            .mockResolvedValueOnce(document) // inside the transaction
            .mockRejectedValueOnce(new Error("refetch failed")); // final re-fetch, after commit

        await expect(
            confirmReplacementUpload("confirmation", "doc-1", "docx", KEY),
        ).rejects.toThrow("refetch failed");

        const pdfKey = storeObject.mock.calls[0][0];
        // The DB swap already committed — the new objects are the live ones now.
        expect(removeDocumentArtifact).not.toHaveBeenCalledWith(KEY);
        expect(removeDocumentArtifact).not.toHaveBeenCalledWith(pdfKey);
        // The old objects are still cleaned up, since that cleanup ran before the re-fetch.
        expect(removeDocumentArtifact).toHaveBeenCalledWith("old.pdf");
        expect(removeDocumentArtifact).toHaveBeenCalledWith("old.docx");
    });
});

describe("getDocumentCapabilities", () => {
    beforeAll(() => {
        vi.useFakeTimers();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    beforeEach(() => {
        vi.clearAllMocks();
        // Monotonically advances past whatever cache the previous tests left
        // behind — re-calling `useFakeTimers()` per tests would instead reset
        // the clock back to the same starting point every time, letting an
        // earlier tests's cached result win forever.
        vi.advanceTimersByTime(61_000);
        browserEndpointIssue.mockReturnValue(null);
        isS3Available.mockResolvedValue(true);
        bucketAllowsBrowserUploads.mockResolvedValue("allowed");
    });

    it("blockiert bei nicht erreichbarem Endpunkt (loopback)", async () => {
        browserEndpointIssue.mockReturnValue("loopback");
        expect(await getDocumentCapabilities()).toEqual({ canReplaceFiles: false, blocker: "endpoint_loopback" });
    });

    it("blockiert bei privatem Netzwerk-Endpunkt", async () => {
        browserEndpointIssue.mockReturnValue("private_network");
        expect(await getDocumentCapabilities()).toEqual({ canReplaceFiles: false, blocker: "endpoint_private_network" });
    });

    it("blockiert, wenn der Speicher nicht erreichbar ist", async () => {
        isS3Available.mockResolvedValue(false);
        expect(await getDocumentCapabilities()).toEqual({ canReplaceFiles: false, blocker: "storage_unreachable" });
    });

    it("blockiert, wenn CORS fehlt", async () => {
        bucketAllowsBrowserUploads.mockResolvedValue("missing");
        expect(await getDocumentCapabilities()).toEqual({ canReplaceFiles: false, blocker: "cors_not_configured" });
    });

    it("erlaubt das Ersetzen, wenn alles passt — auch bei unbekanntem CORS-Status", async () => {
        bucketAllowsBrowserUploads.mockResolvedValue("unknown");
        expect(await getDocumentCapabilities()).toEqual({ canReplaceFiles: true });
    });

    it("cached das Ergebnis innerhalb der TTL, statt erneut zu prüfen", async () => {
        await getDocumentCapabilities();
        await getDocumentCapabilities();

        expect(isS3Available).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(61_000);
        await getDocumentCapabilities();

        expect(isS3Available).toHaveBeenCalledTimes(2);
    });
});
