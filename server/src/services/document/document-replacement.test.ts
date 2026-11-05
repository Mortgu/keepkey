import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AppException } from "../../lib/exceptions.js";

const findWithArtifacts = vi.fn();
const getDocumentArtifact = vi.fn();
const getDocumentUploadUrl = vi.fn();
const removeDocumentArtifact = vi.fn(async (..._args: unknown[]) => undefined);
const storeObject = vi.fn();
const browserEndpointIssue = vi.fn();
const isS3Available = vi.fn();
const bucketAllowsBrowserUploads = vi.fn();
const assertEditable = vi.fn();
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
        assertEditable: (...args: unknown[]) => assertEditable(...args),
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
    await import("./document-replacement.js");

const KEY = "replaced/confirmations/doc-1/upload.docx";

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

describe("confirmReplacementUpload swaps the stored pair", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getDocumentArtifact.mockResolvedValue(Buffer.from("docx"));
        storeObject.mockImplementation(async (objectKey: string) => ({ objectKey, size: 1, sha256: "pdf-hash" }));
        assertEditable.mockResolvedValue(undefined);
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
        // Monotonically advances past whatever cache the previous test left
        // behind — re-calling `useFakeTimers()` per test would instead reset
        // the clock back to the same starting point every time, letting an
        // earlier test's cached result win forever.
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
