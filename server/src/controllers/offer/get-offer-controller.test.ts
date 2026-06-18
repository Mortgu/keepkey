import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

// Prisma-Client mocken, bevor der Controller importiert wird.
const offerRevisionFindMany = vi.fn();
const offerDocumentFindFirst = vi.fn();

vi.mock("../../lib/prismaClient.js", () => ({
  prisma: {
    offerRevision: { findMany: offerRevisionFindMany },
    offerDocument: { findFirst: offerDocumentFindFirst },
  },
}));

const { getOfferRevisions, downloadOfferDocument } = await import(
  "./get-offer-controller.js"
);

/** Baut ein Express-Response-Mock mit verketteten Spies. */
function buildResponse() {
  const res = {} as Response & {
    statusCode?: number;
    body?: unknown;
    downloadArgs?: unknown[];
  };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  }) as unknown as Response["status"];
  res.json = vi.fn((payload: unknown) => {
    res.body = payload;
    return res;
  }) as unknown as Response["json"];
  res.download = vi.fn((...args: unknown[]) => {
    res.downloadArgs = args;
    return res;
  }) as unknown as Response["download"];
  return res;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getOfferRevisions", () => {
  it("liefert Revisionen absteigend sortiert mit Status 200", async () => {
    const revisions = [{ id: "r2", version: 2 }];
    offerRevisionFindMany.mockResolvedValue(revisions);

    const req = { params: { id: "offer1" } } as unknown as Request;
    const res = buildResponse();

    await getOfferRevisions(req, res);

    expect(offerRevisionFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { offerId: "offer1" },
        orderBy: { version: "desc" },
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(revisions);
  });
});

describe("downloadOfferDocument", () => {
  const req = {
    params: { id: "offer1", documentId: "doc1" },
  } as unknown as Request;

  it("antwortet 404, wenn kein Dokument gefunden wird", async () => {
    offerDocumentFindFirst.mockResolvedValue(null);
    const res = buildResponse();

    await downloadOfferDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Document not found" });
  });

  it("antwortet 409, wenn das Dokument noch nicht generiert ist", async () => {
    offerDocumentFindFirst.mockResolvedValue({
      document: { status: "PENDING", path: null },
    });
    const res = buildResponse();

    await downloadOfferDocument(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Document not yet generated" });
  });

  it("startet den Download bei generiertem Dokument", async () => {
    offerDocumentFindFirst.mockResolvedValue({
      document: {
        id: "doc1",
        status: "GENERATED",
        path: "/tmp/doc1.pdf",
        format: "PDF",
        displayName: "Angebot_001",
      },
    });
    const res = buildResponse();

    await downloadOfferDocument(req, res);

    expect(res.download).toHaveBeenCalledWith("/tmp/doc1.pdf", "Angebot_001.pdf");
  });
});
