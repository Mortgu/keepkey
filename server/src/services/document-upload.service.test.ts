import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    offerFindFirst: vi.fn(),
    offerFindUnique: vi.fn(),
    offerUpdateMany: vi.fn(),
    orderFindFirst: vi.fn(),
    orderFindUnique: vi.fn(),
    orderUpdateMany: vi.fn(),
    finalOfferUpdateMany: vi.fn(),
    finalOrderUpdateMany: vi.fn(),
    documentUpdate: vi.fn(),
    transaction: vi.fn(),
    uploadDocumentArtifact: vi.fn(),
    loggerError: vi.fn(),
    loggerWarn: vi.fn(),
}));

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        offerDocument: {
            findFirst: mocks.offerFindFirst,
            findUnique: mocks.offerFindUnique,
            updateMany: mocks.offerUpdateMany,
        },
        orderDocument: {
            findFirst: mocks.orderFindFirst,
            findUnique: mocks.orderFindUnique,
            updateMany: mocks.orderUpdateMany,
        },
        $transaction: mocks.transaction,
    },
}));

vi.mock("../lib/nextcloud-document-store.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../lib/nextcloud-document-store.js")>();
    return { ...actual, uploadDocumentArtifact: mocks.uploadDocumentArtifact };
});

vi.mock("../middlewares/logger.js", () => ({
    default: { error: mocks.loggerError, warn: mocks.loggerWarn },
}));

import { AppException } from "../lib/exceptions.js";
import { RemoteDocumentConflictError, sha256Document } from "../lib/nextcloud-document-store.js";
import { uploadOfferDocument, uploadOrderDocument } from "./document-upload.service.js";

describe("document upload service", () => {
    let outputDirectory: string;
    let offerDocument: any;
    let orderDocument: any;

    beforeEach(async () => {
        vi.clearAllMocks();
        outputDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "keepit-upload-"));
        const pdf = Buffer.from("pdf-content");
        const docx = Buffer.from("docx-content");
        await Promise.all([
            fs.writeFile(path.join(outputDirectory, "local.pdf"), pdf),
            fs.writeFile(path.join(outputDirectory, "local.docx"), docx),
        ]);
        const artifacts = {
            pdf: {
                id: "pdf-1",
                filename: path.join(outputDirectory, "local.pdf"),
                basename: "local.pdf",
                path: outputDirectory,
                size: pdf.length,
                sha256: sha256Document(pdf),
                uploadedAt: null,
                remotePath: null,
                remoteEtag: null,
            },
            docx: {
                id: "docx-1",
                filename: path.join(outputDirectory, "local.docx"),
                basename: "local.docx",
                path: outputDirectory,
                size: docx.length,
                sha256: sha256Document(docx),
                uploadedAt: null,
                remotePath: null,
                remoteEtag: null,
            },
        };
        offerDocument = {
            id: "offer-document-1",
            status: "GENERATED",
            displayName: "Q-1_AG_Customer",
            updatedAt: new Date(),
            ...artifacts,
        };
        orderDocument = {
            id: "order-document-1",
            status: "GENERATED",
            displayName: "O-1_BE_Customer",
            updatedAt: new Date(),
            ...artifacts,
        };

        mocks.offerFindFirst.mockResolvedValue(offerDocument);
        mocks.offerFindUnique.mockResolvedValue(offerDocument);
        mocks.offerUpdateMany.mockResolvedValue({ count: 1 });
        mocks.orderFindFirst.mockResolvedValue(orderDocument);
        mocks.orderFindUnique.mockResolvedValue(orderDocument);
        mocks.orderUpdateMany.mockResolvedValue({ count: 1 });
        mocks.finalOfferUpdateMany.mockResolvedValue({ count: 1 });
        mocks.finalOrderUpdateMany.mockResolvedValue({ count: 1 });
        mocks.transaction.mockImplementation(async (callback) => callback({
            offerDocument: { updateMany: mocks.finalOfferUpdateMany },
            orderDocument: { updateMany: mocks.finalOrderUpdateMany },
            document: { update: mocks.documentUpdate },
        }));
        mocks.uploadDocumentArtifact.mockImplementation((filename: string, directory: string, content: Buffer, sha256: string) => Promise.resolve({
            remotePath: `${directory}/${filename}`,
            remoteEtag: `etag-${filename}`,
            uploadedAt: new Date("2026-07-12T13:00:00.000Z"),
            size: content.length,
            sha256,
        }));
    });

    afterEach(async () => {
        await fs.rm(outputDirectory, { recursive: true, force: true });
    });

    it("beansprucht, verifiziert und finalisiert einen Offer-Upload", async () => {
        const result = await uploadOfferDocument("offer-1", offerDocument.id);

        expect(mocks.offerUpdateMany).toHaveBeenCalledWith({
            where: {
                id: offerDocument.id,
                OR: [
                    { status: { in: ["GENERATED", "FAILED"] }, uploadToken: null },
                    { status: "UPLOADING", updatedAt: { lt: expect.any(Date) } },
                ],
            },
            data: { status: "UPLOADING", uploadToken: expect.any(String), error: null },
        });
        expect(mocks.uploadDocumentArtifact).toHaveBeenCalledTimes(2);
        expect(mocks.finalOfferUpdateMany).toHaveBeenCalledWith({
            where: {
                id: offerDocument.id,
                status: "UPLOADING",
                uploadToken: expect.any(String),
            },
            data: { status: "UPLOADED", uploadToken: null, error: null },
        });
        expect(mocks.documentUpdate).toHaveBeenCalledTimes(2);
        expect(result.pdf.remotePath).toContain("Q-1_AG_Customer.pdf");
        await expect(fs.access(path.join(outputDirectory, "local.pdf"))).rejects.toThrow();
        await expect(fs.access(path.join(outputDirectory, "local.docx"))).rejects.toThrow();
    });

    it("verwendet denselben Upload-Ablauf für Order-Dokumente", async () => {
        await uploadOrderDocument("order-1", orderDocument.id);

        expect(mocks.orderUpdateMany).toHaveBeenCalledOnce();
        expect(mocks.finalOrderUpdateMany).toHaveBeenCalledOnce();
        expect(mocks.uploadDocumentArtifact).toHaveBeenCalledTimes(2);
    });

    it("setzt einen Hashkonflikt auf GENERATED zurück und behält lokale Dateien", async () => {
        mocks.uploadDocumentArtifact.mockRejectedValueOnce(
            new RemoteDocumentConflictError("/pdf/conflict.pdf", "expected", "actual"),
        );

        const error = await uploadOfferDocument("offer-1", offerDocument.id).catch((value) => value);

        expect(error).toBeInstanceOf(AppException);
        expect(error).toMatchObject({ statusCode: 409, code: "REMOTE_DOCUMENT_CONFLICT" });
        expect(mocks.offerUpdateMany).toHaveBeenLastCalledWith({
            where: {
                id: offerDocument.id,
                status: "UPLOADING",
                uploadToken: expect.any(String),
            },
            data: {
                status: "GENERATED",
                uploadToken: null,
                error: expect.stringContaining("different content"),
            },
        });
        await expect(fs.access(path.join(outputDirectory, "local.pdf"))).resolves.toBeUndefined();
        await expect(fs.access(path.join(outputDirectory, "local.docx"))).resolves.toBeUndefined();
    });

    it("weist einen parallelen aktiven Upload zurück", async () => {
        mocks.offerUpdateMany.mockResolvedValueOnce({ count: 0 });
        mocks.offerFindUnique.mockResolvedValue({ ...offerDocument, status: "UPLOADING" });

        await expect(uploadOfferDocument("offer-1", offerDocument.id)).rejects.toMatchObject({
            statusCode: 409,
            code: "DOCUMENT_UPLOAD_IN_PROGRESS",
        });
        expect(mocks.uploadDocumentArtifact).not.toHaveBeenCalled();
    });

    it("behandelt einen bereits abgeschlossenen Upload als No-op", async () => {
        const uploadedAt = new Date("2026-07-12T13:00:00.000Z");
        mocks.offerFindFirst.mockResolvedValue({
            ...offerDocument,
            status: "UPLOADED",
            pdf: { ...offerDocument.pdf, remotePath: "/pdf/existing.pdf", uploadedAt },
            docx: { ...offerDocument.docx, remotePath: "/docx/existing.docx", uploadedAt },
        });

        const result = await uploadOfferDocument("offer-1", offerDocument.id);

        expect(result.pdf.remotePath).toBe("/pdf/existing.pdf");
        expect(mocks.offerUpdateMany).not.toHaveBeenCalled();
        expect(mocks.uploadDocumentArtifact).not.toHaveBeenCalled();
    });

    it("behält lokale Dateien bei einem DB-Fehler nach Remote-Erfolg", async () => {
        mocks.transaction.mockRejectedValue(new Error("database unavailable"));

        await expect(uploadOfferDocument("offer-1", offerDocument.id)).rejects.toMatchObject({
            code: "DOCUMENT_UPLOAD_FAILED",
        });
        expect(mocks.offerUpdateMany).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({ status: "GENERATED", uploadToken: null }),
        }));
        await expect(fs.access(path.join(outputDirectory, "local.pdf"))).resolves.toBeUndefined();
        await expect(fs.access(path.join(outputDirectory, "local.docx"))).resolves.toBeUndefined();
    });

    it("erkennt einen trotz Clientfehler erfolgreich commiteten Upload", async () => {
        const uploadedAt = new Date("2026-07-12T13:00:00.000Z");
        mocks.transaction.mockRejectedValue(new Error("connection lost after commit"));
        mocks.uploadDocumentArtifact.mockImplementation((filename: string, _directory: string, content: Buffer, sha256: string) => Promise.resolve({
            remotePath: `/remote/${filename}`,
            remoteEtag: `etag-${filename}`,
            uploadedAt,
            size: content.length,
            sha256,
        }));
        mocks.offerFindUnique.mockResolvedValue({
            ...offerDocument,
            status: "UPLOADED",
            pdf: {
                ...offerDocument.pdf,
                remotePath: "/remote/Q-1_AG_Customer.pdf",
                remoteEtag: "etag-Q-1_AG_Customer.pdf",
                uploadedAt,
            },
            docx: {
                ...offerDocument.docx,
                remotePath: "/remote/Q-1_AG_Customer.docx",
                remoteEtag: "etag-Q-1_AG_Customer.docx",
                uploadedAt,
            },
        });

        await expect(uploadOfferDocument("offer-1", offerDocument.id)).resolves.toMatchObject({
            pdf: { remotePath: "/remote/Q-1_AG_Customer.pdf" },
            docx: { remotePath: "/remote/Q-1_AG_Customer.docx" },
        });
        expect(mocks.offerUpdateMany).toHaveBeenCalledOnce();
        await expect(fs.access(path.join(outputDirectory, "local.pdf"))).rejects.toThrow();
        await expect(fs.access(path.join(outputDirectory, "local.docx"))).rejects.toThrow();
    });
});
