import { createHash } from "crypto";
import { DeleteObjectCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getSignedUrl: vi.fn() }));

vi.mock("@aws-sdk/s3-request-presigner", () => ({ getSignedUrl: mocks.getSignedUrl }));

import {
    getDocumentDownloadUrl,
    initDocumentArtifactStore,
    removeDocumentArtifacts,
    storeDocumentArtifacts,
} from "./document-artifact-store.js";

describe("document artifact store", () => {
    const send = vi.spyOn(S3Client.prototype, "send");

    beforeEach(() => {
        send.mockReset();
        send.mockResolvedValue({} as never);
        mocks.getSignedUrl.mockReset();
        mocks.getSignedUrl.mockResolvedValue("http://localhost:3900/signed-download");
    });

    it("stores DOCX and PDF under immutable object keys", async () => {
        const stored = await storeDocumentArtifacts(
            "offers",
            "document-1",
            Buffer.from("docx-content"),
            Buffer.from("pdf-content"),
            "generation-1",
        );

        expect(stored.docx).toEqual({
            objectKey: "generated/offers/document-1/generation-1.docx",
            size: 12,
            sha256: createHash("sha256").update("docx-content").digest("hex"),
        });
        expect(stored.pdf).toEqual({
            objectKey: "generated/offers/document-1/generation-1.pdf",
            size: 11,
            sha256: createHash("sha256").update("pdf-content").digest("hex"),
        });
        expect(send).toHaveBeenCalledTimes(2);
        expect(send.mock.calls.map(([command]) => (command as PutObjectCommand).input.Key).sort()).toEqual([
            stored.docx.objectKey,
            stored.pdf.objectKey,
        ]);
    });

    it("removes both objects when publication fails", async () => {
        send.mockImplementation(async (command) => {
            if (command instanceof PutObjectCommand && command.input.Key?.endsWith(".pdf")) {
                throw new Error("upload failed");
            }
            return {} as never;
        });

        await expect(storeDocumentArtifacts(
            "orders",
            "document-1",
            Buffer.from("docx"),
            Buffer.from("pdf"),
            "generation-1",
        )).rejects.toThrow("One or more document artifact operations failed.");

        const deleted = send.mock.calls
            .map(([command]) => command)
            .filter((command) => command instanceof DeleteObjectCommand)
            .map((command) => (command as DeleteObjectCommand).input.Key)
            .sort();
        expect(deleted).toEqual([
            "generated/orders/document-1/generation-1.docx",
            "generated/orders/document-1/generation-1.pdf",
        ]);
    });

    it("removes an unpublished artifact pair explicitly", async () => {
        const stored = await storeDocumentArtifacts(
            "offers",
            "document-1",
            Buffer.from("docx"),
            Buffer.from("pdf"),
            "generation-1",
        );
        send.mockClear();

        await removeDocumentArtifacts(stored);

        expect(send.mock.calls.every(([command]) => command instanceof DeleteObjectCommand)).toBe(true);
        expect(send).toHaveBeenCalledTimes(2);
    });

    it("checks bucket access during startup", async () => {
        await initDocumentArtifactStore();
        expect(send).toHaveBeenCalledWith(expect.any(HeadBucketCommand));
    });

    it("creates a five-minute signed download URL with response headers", async () => {
        await expect(getDocumentDownloadUrl(
            "generated/offers/document-1/generation-1.pdf",
            "Offer.pdf",
            "application/pdf",
        )).resolves.toBe("http://localhost:3900/signed-download");

        expect(mocks.getSignedUrl).toHaveBeenCalledWith(
            expect.any(S3Client),
            expect.any(GetObjectCommand),
            { expiresIn: 300 },
        );
        const command = mocks.getSignedUrl.mock.calls[0]![1] as GetObjectCommand;
        expect(command.input).toMatchObject({
            Key: "generated/offers/document-1/generation-1.pdf",
            ResponseContentDisposition: 'attachment; filename="Offer.pdf"',
            ResponseContentType: "application/pdf",
        });
    });
});
