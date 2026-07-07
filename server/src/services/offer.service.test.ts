import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppException } from "../lib/exceptions.js";

/* ========== Mocks ========== */

const prismaMock = vi.hoisted(() => {
    const mock: any = {
        offer: {
            findMany: vi.fn(),
            findFirst: vi.fn(),
            findFirstOrThrow: vi.fn(),
            findUniqueOrThrow: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            updateManyAndReturn: vi.fn(),
            delete: vi.fn(),
        },
        offerRevision: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
        offerDocument: {
            findFirst: vi.fn(),
            findFirstOrThrow: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            updateMany: vi.fn(),
            delete: vi.fn(),
        },
        offerPosition: { createMany: vi.fn(), createManyAndReturn: vi.fn(), deleteMany: vi.fn(), aggregate: vi.fn() },
        offerFlatRate: { createMany: vi.fn(), createManyAndReturn: vi.fn(), deleteMany: vi.fn(), aggregate: vi.fn() },
        flatRate: { findMany: vi.fn() },
        task: { create: vi.fn() },
        document: { update: vi.fn() },
    };
    mock.$transaction = vi.fn(async (arg: any) => (Array.isArray(arg) ? Promise.all(arg) : arg(mock)));
    return mock;
});

const fsMock = vi.hoisted(() => ({
    access: vi.fn(),
    readFile: vi.fn(),
    rm: vi.fn(),
}));

const calculatePriceOrThrow = vi.hoisted(() => vi.fn());
const downloadDocumentStream = vi.hoisted(() => vi.fn());
const enqueueTask = vi.hoisted(() => vi.fn());
const uploadDocument = vi.hoisted(() => vi.fn());

vi.mock("../lib/prismaClient.js", () => ({ prisma: prismaMock }));

vi.mock("../lib/env.js", () => ({
    default: {
        NEXTCLOUD_OFFER_PDF_PATH: "/nextcloud/pdf",
        NEXTCLOUD_OFFER_ORIGINAL_PATH: "/nextcloud/docx",
    },
}));

vi.mock("../lib/nextcloud.js", () => ({ downloadDocumentStream }));

vi.mock("../lib/document.js", () => ({ enqueueTask, uploadDocument }));

vi.mock("../middlewares/logger.js", () => ({
    default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock("../utils/products.js", () => ({ calculatePriceOrThrow }));

vi.mock("fs", () => ({
    default: { promises: fsMock },
    promises: fsMock,
}));

const offerService = await import("./offer.service.js");

beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (arg: any) =>
        Array.isArray(arg) ? Promise.all(arg) : arg(prismaMock),
    );
});

/** Erwartet eine AppException mit Status + Code. */
async function expectAppException(promise: Promise<unknown>, statusCode: number, code: string) {
    const error = await promise.then(
        () => null,
        (e) => e,
    );
    expect(error).toBeInstanceOf(AppException);
    expect((error as AppException).statusCode).toBe(statusCode);
    expect((error as AppException).code).toBe(code);
}

/* ========== Queries ========== */

describe("getOfferRevisions", () => {
    it("liefert Revisionen absteigend sortiert", async () => {
        const revisions = [{ id: "r2", version: 2 }];
        prismaMock.offerRevision.findMany.mockResolvedValue(revisions);

        const result = await offerService.getOfferRevisions("offer1");

        expect(prismaMock.offerRevision.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { offerId: "offer1" },
                orderBy: { version: "desc" },
            }),
        );
        expect(result).toBe(revisions);
    });
});

describe("getOfferById", () => {
    it("wirft 404, wenn das Offer nicht existiert", async () => {
        prismaMock.offer.findFirst.mockResolvedValue(null);

        await expectAppException(offerService.getOfferById("missing"), 404, "OFFER_NOT_FOUND");
    });

    it("liefert das Offer inkl. Dokumenten", async () => {
        const offer = { id: "offer1" };
        prismaMock.offer.findFirst.mockResolvedValue(offer);

        await expect(offerService.getOfferById("offer1")).resolves.toBe(offer);
    });
});

describe("getNextQuoteId", () => {
    it("liefert die nächste QuoteId", async () => {
        await expect(offerService.getNextQuoteId()).resolves.toBe(1);
    });
});

describe("getOffers", () => {
    it("normalisiert limit und liefert items + nextCursor", async () => {
        const items = Array.from({ length: 2 }, (_, i) => ({ id: `o${i}` }));
        prismaMock.offer.findMany.mockResolvedValue(items);

        const result = await offerService.getOffers({ limit: "2", search: "AG-1" });

        expect(prismaMock.offer.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                take: 2,
                where: expect.objectContaining({ quoteId: { contains: "AG-1" } }),
            }),
        );
        expect(result.items).toBe(items);
        expect(result.nextCursor).toBe("o1");
    });

    it("clamped limit auf 100 und liefert null-Cursor bei unvollständiger Seite", async () => {
        prismaMock.offer.findMany.mockResolvedValue([{ id: "o1" }]);

        const result = await offerService.getOffers({ limit: "500" });

        expect(prismaMock.offer.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 100 }),
        );
        expect(result.nextCursor).toBeNull();
    });
});

/* ========== downloadOfferDocument ========== */

describe("downloadOfferDocument", () => {
    it("wirft 400 bei ungültigem Format", async () => {
        await expectAppException(
            offerService.downloadOfferDocument("offer1", "doc1", "txt"),
            400,
            "INVALID_FORMAT",
        );
    });

    it("wirft 404, wenn kein Dokument gefunden wird", async () => {
        prismaMock.offerDocument.findFirst.mockResolvedValue(null);

        await expectAppException(
            offerService.downloadOfferDocument("offer1", "doc1", "pdf"),
            404,
            "DOCUMENT_NOT_FOUND",
        );
    });

    it("wirft 409, wenn das Dokument noch nicht generiert ist", async () => {
        prismaMock.offerDocument.findFirst.mockResolvedValue({ status: "PENDING" });

        await expectAppException(
            offerService.downloadOfferDocument("offer1", "doc1", "pdf"),
            409,
            "DOCUMENT_NOT_GENERATED",
        );
    });

    it("wirft 404, wenn die Datei auf der Festplatte fehlt", async () => {
        prismaMock.offerDocument.findFirst.mockResolvedValue({
            id: "doc1",
            status: "GENERATED",
            displayName: "Angebot_001",
            pdf: { path: "/tmp/output", basename: "doc1.pdf", filename: "doc1.pdf" },
            docx: null,
        });
        fsMock.access.mockRejectedValue(new Error("ENOENT"));

        await expectAppException(
            offerService.downloadOfferDocument("offer1", "doc1", "pdf"),
            404,
            "FILE_NOT_FOUND_ON_DISK",
        );
    });

    it("liefert file-Descriptor bei generiertem PDF", async () => {
        prismaMock.offerDocument.findFirst.mockResolvedValue({
            id: "doc1",
            status: "GENERATED",
            displayName: "Angebot_001",
            pdf: { path: "/tmp/output", basename: "doc1.pdf", filename: "doc1.pdf" },
            docx: null,
        });
        fsMock.access.mockResolvedValue(undefined);

        const result = await offerService.downloadOfferDocument("offer1", "doc1", "pdf");

        expect(result).toEqual({
            kind: "file",
            filePath: "/tmp/output/doc1.pdf",
            contentType: "application/pdf",
            downloadName: "Angebot_001.pdf",
        });
    });

    it("liefert docx mit korrektem MIME-Typ", async () => {
        prismaMock.offerDocument.findFirst.mockResolvedValue({
            id: "doc1",
            status: "GENERATED",
            displayName: "Angebot_001",
            pdf: null,
            docx: { path: "/tmp/output", basename: "doc1.docx", filename: "doc1.docx" },
        });
        fsMock.access.mockResolvedValue(undefined);

        const result = await offerService.downloadOfferDocument("offer1", "doc1", "docx");

        expect(result).toMatchObject({
            kind: "file",
            contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            downloadName: "Angebot_001.docx",
        });
    });

    it("streamt hochgeladene Dokumente aus der Nextcloud", async () => {
        prismaMock.offerDocument.findFirst.mockResolvedValue({
            id: "doc1",
            status: "UPLOADED",
            displayName: "Angebot_001",
            pdf: { path: "/nextcloud/pdf", basename: "doc1.pdf", filename: "/remote/doc1.pdf" },
            docx: null,
        });
        const stream = { pipe: vi.fn() };
        downloadDocumentStream.mockResolvedValue(stream);

        const result = await offerService.downloadOfferDocument("offer1", "doc1", "pdf");

        expect(downloadDocumentStream).toHaveBeenCalledWith("/remote/doc1.pdf");
        expect(result).toMatchObject({ kind: "stream", stream });
    });

    it("mapped Nextcloud-Fehler auf 500 NEXTCLOUD_DOWNLOAD_FAILED", async () => {
        prismaMock.offerDocument.findFirst.mockResolvedValue({
            id: "doc1",
            status: "UPLOADED",
            displayName: "Angebot_001",
            pdf: { path: "/nextcloud/pdf", basename: "doc1.pdf", filename: "/remote/doc1.pdf" },
            docx: null,
        });
        downloadDocumentStream.mockRejectedValue(new Error("connection refused"));

        await expectAppException(
            offerService.downloadOfferDocument("offer1", "doc1", "pdf"),
            500,
            "NEXTCLOUD_DOWNLOAD_FAILED",
        );
    });
});

/* ========== createOffer ========== */

const offerFields = {
    customerId: "cust1",
    contactPersonId: "cp1",
    userId: "user1",
    quoteId: "AG-1",
    language: "DE" as const,
    featureComparison: false,
    supplierId: null,
    paymentTerm: "30 Tage netto",
    validUntil: null,
    requestFrom: null,
    date: null,
};

describe("createOffer", () => {
    it("berechnet Preise, net_amount und legt Offer + Positionen + Flatrates an", async () => {
        calculatePriceOrThrow.mockResolvedValue(1000);
        prismaMock.flatRate.findMany.mockResolvedValue([{ id: "fr1", total_cents: 500 }]);
        prismaMock.offer.create.mockResolvedValue({ id: "offer1" });
        prismaMock.offerPosition.createMany.mockResolvedValue({ count: 1 });
        prismaMock.offerFlatRate.createMany.mockResolvedValue({ count: 1 });

        const offer = await offerService.createOffer({
            offer: offerFields,
            positions: [{ productId: "p1", contractId: "c1", duration_months: 12, free_months: 0, quantity: 2 }],
            flatrates: [{ flatRateId: "fr1", quantity: 2 }],
        });

        expect(offer).toEqual({ id: "offer1" });
        expect(calculatePriceOrThrow).toHaveBeenCalledWith(
            expect.objectContaining({ productId: "p1", customerId: "cust1", quantity: 2 }),
        );
        // net_amount = 1000 (Position) + 500 * 2 (Flatrate)
        expect(prismaMock.offer.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ net_amount: 2000 }),
            }),
        );
        expect(prismaMock.offerPosition.createMany).toHaveBeenCalledWith({
            data: [expect.objectContaining({ offerId: "offer1", productId: "p1", total_cents: 1000 })],
        });
        expect(prismaMock.offerFlatRate.createMany).toHaveBeenCalledWith({
            data: [expect.objectContaining({ offerId: "offer1", flatRateId: "fr1", total_cents: 1000 })],
        });
    });

    it("wirft 404 FLAT_RATE_NOT_FOUND bei unbekannter Flatrate", async () => {
        calculatePriceOrThrow.mockResolvedValue(1000);
        prismaMock.flatRate.findMany.mockResolvedValue([]);

        await expectAppException(
            offerService.createOffer({
                offer: offerFields,
                positions: [],
                flatrates: [{ flatRateId: "missing", quantity: 1 }],
            }),
            404,
            "FLAT_RATE_NOT_FOUND",
        );
    });

    it("mapped PriceError auf 422 PRICE_CALCULATION_FAILED", async () => {
        calculatePriceOrThrow.mockRejectedValue(new Error("Price calculation failed: NO_TARIFF"));

        await expectAppException(
            offerService.createOffer({
                offer: offerFields,
                positions: [{ productId: "p1", contractId: "c1", duration_months: 12, free_months: 0, quantity: 1 }],
                flatrates: [],
            }),
            422,
            "PRICE_CALCULATION_FAILED",
        );
    });
});

/* ========== createOfferPositions / createOfferFlatrates ========== */

describe("createOfferPositions", () => {
    it("legt Positionen an und aktualisiert net_amount", async () => {
        calculatePriceOrThrow.mockResolvedValue(300);
        const created = [{ id: "pos1" }];
        prismaMock.offerPosition.createManyAndReturn.mockResolvedValue(created);
        prismaMock.offerPosition.aggregate.mockResolvedValue({ _sum: { total_cents: 300 } });
        prismaMock.offerFlatRate.aggregate.mockResolvedValue({ _sum: { total_cents: 200 } });

        const result = await offerService.createOfferPositions("offer1", [
            { productId: "p1", contractId: "c1", duration_months: 12, free_months: 0, quantity: 1 },
        ]);

        expect(result).toBe(created);
        expect(prismaMock.offerPosition.createManyAndReturn).toHaveBeenCalledWith({
            data: [expect.objectContaining({ offerId: "offer1", total_cents: 300 })],
        });
        expect(prismaMock.offer.update).toHaveBeenCalledWith({
            where: { id: "offer1" },
            data: { net_amount: 500 },
        });
    });
});

describe("createOfferFlatrates", () => {
    it("legt Flatrates an und aktualisiert net_amount", async () => {
        prismaMock.flatRate.findMany.mockResolvedValue([{ id: "fr1", total_cents: 500 }]);
        const created = [{ id: "ofr1" }];
        prismaMock.offerFlatRate.createManyAndReturn.mockResolvedValue(created);
        prismaMock.offerPosition.aggregate.mockResolvedValue({ _sum: { total_cents: 0 } });
        prismaMock.offerFlatRate.aggregate.mockResolvedValue({ _sum: { total_cents: 500 } });

        const result = await offerService.createOfferFlatrates("offer1", [{ flatRateId: "fr1", quantity: 2 }]);

        expect(result).toBe(created);
        // Bestehendes Verhalten: total_cents = rate (ohne quantity-Multiplikation)
        expect(prismaMock.offerFlatRate.createManyAndReturn).toHaveBeenCalledWith({
            data: [expect.objectContaining({ offerId: "offer1", flatRateId: "fr1", total_cents: 500 })],
        });
        expect(prismaMock.offer.update).toHaveBeenCalledWith({
            where: { id: "offer1" },
            data: { net_amount: 500 },
        });
    });

    it("wirft 404 FLAT_RATE_NOT_FOUND bei unbekannter Flatrate", async () => {
        prismaMock.flatRate.findMany.mockResolvedValue([]);
        prismaMock.offerFlatRate.createManyAndReturn.mockImplementation(async ({ data }: any) => data);

        await expectAppException(
            offerService.createOfferFlatrates("offer1", [{ flatRateId: "missing", quantity: 1 }]),
            404,
            "FLAT_RATE_NOT_FOUND",
        );
    });
});

/* ========== updateOffer ========== */

describe("updateOffer", () => {
    it("legt Revision an, aktualisiert Offer und ersetzt Positionen/Flatrates", async () => {
        calculatePriceOrThrow.mockResolvedValue(1000);
        prismaMock.flatRate.findMany.mockResolvedValue([{ id: "fr1", total_cents: 250 }]);
        prismaMock.offer.findFirstOrThrow.mockResolvedValue({
            id: "offer1",
            version: 3,
            offerPositions: [],
            offerFlatRates: [],
        });
        const updated = { id: "offer1", version: 4 };
        prismaMock.offer.updateManyAndReturn.mockResolvedValue([updated]);

        const result = await offerService.updateOffer(
            "offer1",
            {
                offer: { ...offerFields, quoteId: "AG-2" },
                positions: [{ productId: "p1", contractId: "c1", duration_months: 12, free_months: 0, quantity: 1 }],
                flatrates: [{ flatRateId: "fr1", quantity: 2 }],
            },
            "actor1",
        );

        expect(result).toBe(updated);
        expect(prismaMock.offerRevision.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ offerId: "offer1", version: 3, changedById: "actor1" }),
        });
        // net_amount = 1000 + 250 * 2
        expect(prismaMock.offer.updateManyAndReturn).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "offer1" },
                data: expect.objectContaining({ net_amount: 1500, version: { increment: 1 } }),
            }),
        );
        expect(prismaMock.offerPosition.deleteMany).toHaveBeenCalledWith({ where: { offerId: "offer1" } });
        expect(prismaMock.offerFlatRate.deleteMany).toHaveBeenCalledWith({ where: { offerId: "offer1" } });
    });
});

/* ========== enqueueGeneration ========== */

describe("enqueueGeneration", () => {
    it("erzeugt Task + OfferDocument mit nächster Version und enqueued den Task", async () => {
        prismaMock.offer.findUniqueOrThrow.mockResolvedValue({
            id: "offer1",
            quoteId: "AG-1",
            language: "DE",
            customer: { companyName: "ACME GmbH" },
            offerPositions: [
                { product: { translations: [{ language: "DE", name: "Microsoft 365" }] } },
            ],
        });
        prismaMock.offerDocument.findFirst.mockResolvedValue({ version: 2 });
        const task = { id: "task1" };
        prismaMock.task.create.mockResolvedValue(task);
        prismaMock.offerDocument.create.mockResolvedValue({ id: "doc1" });

        const result = await offerService.enqueueGeneration("offer1");

        expect(result).toBe(task);
        expect(prismaMock.offerDocument.updateMany).toHaveBeenCalledWith({
            where: { offerId: "offer1", isCurrent: true },
            data: { isCurrent: false },
        });
        expect(prismaMock.offerDocument.create).toHaveBeenCalledWith({
            data: expect.objectContaining({ offerId: "offer1", version: 3, taskId: "task1", isCurrent: true }),
        });
        expect(enqueueTask).toHaveBeenCalledWith("task1");
    });
});

/* ========== uploadOfferDocument ========== */

describe("uploadOfferDocument", () => {
    const offerDoc = {
        id: "doc1",
        displayName: "Angebot_001",
        pdf: { id: "pdf1", path: "/tmp/output", basename: "doc1.pdf" },
        docx: { id: "docx1", path: "/tmp/output", basename: "doc1.docx" },
    };

    it("wirft 404, wenn pdf/docx noch nicht generiert sind", async () => {
        prismaMock.offerDocument.findFirstOrThrow.mockResolvedValue({ ...offerDoc, pdf: null });

        await expectAppException(
            offerService.uploadOfferDocument("offer1", "doc1"),
            404,
            "DOCUMENTS_NOT_GENERATED",
        );
    });

    it("lädt beide Dateien hoch, aktualisiert DB und räumt lokal auf", async () => {
        prismaMock.offerDocument.findFirstOrThrow.mockResolvedValue(offerDoc);
        fsMock.readFile.mockResolvedValue(Buffer.from("content"));
        fsMock.rm.mockResolvedValue(undefined);
        const pdfResult = { remotePath: "/nextcloud/pdf/Angebot_001.pdf", uploadedAt: new Date(), size: 7 };
        const docxResult = { remotePath: "/nextcloud/docx/Angebot_001.docx", uploadedAt: new Date(), size: 7 };
        uploadDocument.mockResolvedValueOnce(pdfResult).mockResolvedValueOnce(docxResult);

        const result = await offerService.uploadOfferDocument("offer1", "doc1");

        expect(result).toEqual({ pdf: pdfResult, docx: docxResult });
        expect(uploadDocument).toHaveBeenCalledWith("Angebot_001.pdf", "/nextcloud/pdf", expect.any(Buffer));
        expect(uploadDocument).toHaveBeenCalledWith("Angebot_001.docx", "/nextcloud/docx", expect.any(Buffer));
        expect(prismaMock.offerDocument.update).toHaveBeenCalledWith({
            where: { id: "doc1" },
            data: { status: "UPLOADED" },
        });
        expect(fsMock.rm).toHaveBeenCalledTimes(2);
    });

    it("persistiert FAILED-Status und wirft 500 bei Upload-Fehler", async () => {
        prismaMock.offerDocument.findFirstOrThrow.mockResolvedValue(offerDoc);
        fsMock.readFile.mockResolvedValue(Buffer.from("content"));
        uploadDocument.mockRejectedValue(new Error("dav error"));
        prismaMock.offerDocument.update.mockResolvedValue({});

        await expectAppException(
            offerService.uploadOfferDocument("offer1", "doc1"),
            500,
            "DOCUMENT_UPLOAD_FAILED",
        );

        expect(prismaMock.offerDocument.update).toHaveBeenCalledWith({
            where: { id: "doc1" },
            data: { status: "FAILED", error: "dav error" },
        });
    });
});

/* ========== Deletes ========== */

describe("deleteOffer", () => {
    it("wirft 400 bei fehlender id", async () => {
        await expectAppException(offerService.deleteOffer(""), 400, "MISSING_ID");
    });

    it("löscht das Offer", async () => {
        prismaMock.offer.findUniqueOrThrow.mockResolvedValue({ id: "offer1" });
        prismaMock.offer.delete.mockResolvedValue({ id: "offer1" });

        await offerService.deleteOffer("offer1");

        expect(prismaMock.offer.delete).toHaveBeenCalledWith({ where: { id: "offer1" } });
    });
});

describe("deleteOfferDocument", () => {
    it("wirft 404, wenn das Dokument nicht existiert", async () => {
        prismaMock.offerDocument.findFirst.mockResolvedValue(null);

        await expectAppException(
            offerService.deleteOfferDocument("offer1", "doc1"),
            404,
            "DOCUMENT_NOT_FOUND",
        );
    });

    it("löscht lokale Dateien und den DB-Eintrag", async () => {
        prismaMock.offerDocument.findFirst.mockResolvedValue({
            id: "doc1",
            pdf: { path: "/tmp/output", basename: "doc1.pdf" },
            docx: { path: "/tmp/output", basename: "doc1.docx" },
        });
        fsMock.rm.mockResolvedValue(undefined);
        prismaMock.offerDocument.delete.mockResolvedValue({});

        await offerService.deleteOfferDocument("offer1", "doc1");

        expect(fsMock.rm).toHaveBeenCalledWith("/tmp/output/doc1.pdf", { force: true });
        expect(fsMock.rm).toHaveBeenCalledWith("/tmp/output/doc1.docx", { force: true });
        expect(prismaMock.offerDocument.delete).toHaveBeenCalledWith({ where: { id: "doc1" } });
    });
});

describe("deleteOfferRevision", () => {
    it("löscht die Revision", async () => {
        prismaMock.offerRevision.delete.mockResolvedValue({});

        await offerService.deleteOfferRevision("rev1");

        expect(prismaMock.offerRevision.delete).toHaveBeenCalledWith({ where: { id: "rev1" } });
    });
});
