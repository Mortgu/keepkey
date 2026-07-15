import { beforeEach, describe, expect, it, vi } from "vitest";

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
    getDocumentArtifact: vi.fn(),
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

vi.mock("../lib/document-artifact-store.js", () => ({
    getDocumentArtifact: mocks.getDocumentArtifact,
}));

vi.mock("../middlewares/logger.js", () => ({
    default: { error: mocks.loggerError, warn: mocks.loggerWarn },
}));

import { AppException } from "../lib/exceptions.js";
import { RemoteDocumentConflictError, sha256Document } from "../lib/nextcloud-document-store.js";
import { uploadGeneratedDocument } from "./document-upload.service.js";

describe("document upload service", () => {
    let offerDocument: any;
    let orderDocument: any;

    beforeEach(() => {
        vi.clearAllMocks();
        const pdf = Buffer.from("pdf-content");
        const docx = Buffer.from("docx-content");
        mocks.getDocumentArtifact.mockImplementation((objectKey: string) => Promise.resolve(
            objectKey.endsWith(".pdf") ? pdf : docx,
        ));
        const artifacts = [
            {
                id: "pdf-1",
                format: "PDF",
                objectKey: "generated/offers/offer-document-1/generation-1.pdf",
                size: pdf.length,
                sha256: sha256Document(pdf),
                uploadedAt: null,
                remotePath: null,
                remoteEtag: null,
            },
            {
                id: "docx-1",
                format: "DOCX",
                objectKey: "generated/offers/offer-document-1/generation-1.docx",
                size: docx.length,
                sha256: sha256Document(docx),
                uploadedAt: null,
                remotePath: null,
                remoteEtag: null,
            },
        ];
        offerDocument = {
            id: "offer-document-1",
            status: "GENERATED",
            displayName: "Q-1_AG_Customer",
            updatedAt: new Date(),
            artifacts,
        };
        orderDocument = {
            id: "order-document-1",
            status: "GENERATED",
            displayName: "O-1_BE_Customer",
            updatedAt: new Date(),
            artifacts,
        };

        mocks.offerFindFirst.mockResolvedValue(offerDocument);
        mocks.offerFindUnique.mockResolvedValue({ ...offerDocument, status: "UPLOADING" });
        mocks.offerUpdateMany.mockResolvedValue({ count: 1 });
        mocks.orderFindFirst.mockResolvedValue(orderDocument);
        mocks.orderFindUnique.mockResolvedValue({ ...orderDocument, status: "UPLOADING" });
        mocks.orderUpdateMany.mockResolvedValue({ count: 1 });
        mocks.finalOfferUpdateMany.mockResolvedValue({ count: 1 });
        mocks.finalOrderUpdateMany.mockResolvedValue({ count: 1 });
        mocks.transaction.mockImplementation(async (callback) => callback({
            offerDocument: { updateMany: mocks.finalOfferUpdateMany },
            orderDocument: { updateMany: mocks.finalOrderUpdateMany },
            documentArtifact: { update: mocks.documentUpdate },
        }));
        mocks.uploadDocumentArtifact.mockImplementation((filename: string, directory: string, content: Buffer, sha256: string) => Promise.resolve({
            remotePath: `${directory}/${filename}`,
            remoteEtag: `etag-${filename}`,
            uploadedAt: new Date("2026-07-12T13:00:00.000Z"),
            size: content.length,
            sha256,
        }));
    });

    it("beansprucht, verifiziert und finalisiert einen Offer-Upload", async () => {
        const result = await uploadGeneratedDocument("offer", offerDocument.id);

        expect(mocks.offerUpdateMany).toHaveBeenCalledWith({
            where: {
                id: offerDocument.id,
                deletedAt: null,
                OR: [
                    { status: "GENERATED", uploadToken: null },
                    { status: "UPLOADING", updatedAt: { lt: expect.any(Date) } },
                ],
            },
            data: { status: "UPLOADING", uploadToken: expect.any(String), error: null },
        });
        expect(mocks.uploadDocumentArtifact).toHaveBeenCalledTimes(2);
        expect(mocks.finalOfferUpdateMany).toHaveBeenCalledWith({
            where: {
                id: offerDocument.id,
                deletedAt: null,
                status: "UPLOADING",
                uploadToken: expect.any(String),
            },
            data: { status: "UPLOADED", uploadToken: null, error: null },
        });
        expect(mocks.documentUpdate).toHaveBeenCalledTimes(2);
        expect(result.pdf.remotePath).toContain("Q-1_AG_Customer.pdf");
        expect(mocks.getDocumentArtifact).toHaveBeenCalledTimes(2);
    });

    it("verwendet denselben Upload-Ablauf für Order-Dokumente", async () => {
        await uploadGeneratedDocument("order", orderDocument.id);

        expect(mocks.orderUpdateMany).toHaveBeenCalledOnce();
        expect(mocks.finalOrderUpdateMany).toHaveBeenCalledOnce();
        expect(mocks.uploadDocumentArtifact).toHaveBeenCalledTimes(2);
    });

    it("rejects failed generations without claiming an upload lease", async () => {
        mocks.offerFindFirst.mockResolvedValue({
            ...offerDocument,
            status: "FAILED",
            artifacts: [],
        });

        await expect(uploadGeneratedDocument("offer", offerDocument.id)).rejects.toMatchObject({
            statusCode: 409,
            code: "DOCUMENTS_NOT_GENERATED",
        });
        expect(mocks.offerUpdateMany).not.toHaveBeenCalled();
    });

    it("verwendet nach dem Claim den aktuellen Anzeigenamen", async () => {
        mocks.offerFindUnique.mockResolvedValue({
            ...offerDocument,
            status: "UPLOADING",
            displayName: "Q-1_AG_Renamed",
        });

        await uploadGeneratedDocument("offer", offerDocument.id);

        expect(mocks.uploadDocumentArtifact).toHaveBeenCalledWith(
            "Q-1_AG_Renamed.pdf",
            expect.any(String),
            expect.any(Buffer),
            expect.any(String),
        );
    });

    it("setzt einen Hashkonflikt auf GENERATED zurück und behält S3-Objekte", async () => {
        mocks.uploadDocumentArtifact.mockRejectedValueOnce(
            new RemoteDocumentConflictError("/pdf/conflict.pdf", "expected", "actual"),
        );

        const error = await uploadGeneratedDocument("offer", offerDocument.id).catch((value: unknown) => value);

        expect(error).toBeInstanceOf(AppException);
        expect(error).toMatchObject({ statusCode: 409, code: "REMOTE_DOCUMENT_CONFLICT" });
        expect(mocks.offerUpdateMany).toHaveBeenLastCalledWith({
            where: {
                id: offerDocument.id,
                deletedAt: null,
                status: "UPLOADING",
                uploadToken: expect.any(String),
            },
            data: {
                status: "GENERATED",
                uploadToken: null,
                error: expect.stringContaining("different content"),
            },
        });
        expect(mocks.getDocumentArtifact).toHaveBeenCalledTimes(2);
    });

    it("weist einen parallelen aktiven Upload zurück", async () => {
        mocks.offerUpdateMany.mockResolvedValueOnce({ count: 0 });
        mocks.offerFindUnique.mockResolvedValue({ ...offerDocument, status: "UPLOADING" });

        await expect(uploadGeneratedDocument("offer", offerDocument.id)).rejects.toMatchObject({
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
            artifacts: offerDocument.artifacts.map((artifact: any) => ({
                ...artifact,
                remotePath: artifact.format === "PDF" ? "/pdf/existing.pdf" : "/docx/existing.docx",
                uploadedAt,
            })),
        });

        const result = await uploadGeneratedDocument("offer", offerDocument.id);

        expect(result.pdf.remotePath).toBe("/pdf/existing.pdf");
        expect(mocks.offerUpdateMany).not.toHaveBeenCalled();
        expect(mocks.uploadDocumentArtifact).not.toHaveBeenCalled();
    });

    it("behält S3-Objekte bei einem DB-Fehler nach Remote-Erfolg", async () => {
        mocks.transaction.mockRejectedValue(new Error("database unavailable"));

        await expect(uploadGeneratedDocument("offer", offerDocument.id)).rejects.toMatchObject({
            code: "DOCUMENT_UPLOAD_FAILED",
        });
        expect(mocks.offerUpdateMany).toHaveBeenLastCalledWith(expect.objectContaining({
            data: expect.objectContaining({ status: "GENERATED", uploadToken: null }),
        }));
        expect(mocks.getDocumentArtifact).toHaveBeenCalledTimes(2);
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
        mocks.offerFindUnique
            .mockResolvedValueOnce({ ...offerDocument, status: "UPLOADING" })
            .mockResolvedValue({
                ...offerDocument,
                status: "UPLOADED",
                artifacts: offerDocument.artifacts.map((artifact: any) => ({
                    ...artifact,
                    remotePath: artifact.format === "PDF"
                        ? "/remote/Q-1_AG_Customer.pdf"
                        : "/remote/Q-1_AG_Customer.docx",
                    remoteEtag: artifact.format === "PDF"
                        ? "etag-Q-1_AG_Customer.pdf"
                        : "etag-Q-1_AG_Customer.docx",
                    uploadedAt,
                })),
            });

        await expect(uploadGeneratedDocument("offer", offerDocument.id)).resolves.toMatchObject({
            pdf: { remotePath: "/remote/Q-1_AG_Customer.pdf" },
            docx: { remotePath: "/remote/Q-1_AG_Customer.docx" },
        });
        expect(mocks.offerUpdateMany).toHaveBeenCalledOnce();
        expect(mocks.getDocumentArtifact).toHaveBeenCalledTimes(2);
    });
});
