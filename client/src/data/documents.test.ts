import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteDocument,
  documentDownloadUrl,
  renameDocument,
  uploadDocument,
} from "./documents";

const mocks = vi.hoisted(() => ({ api: vi.fn() }));

vi.mock("@/lib/api-client", () => ({
  BASE_URL: "https://api.example",
  api: mocks.api,
}));

describe("document API", () => {
  beforeEach(() => mocks.api.mockReset());

  it("uses type and generated-document ID for mutations", async () => {
    await renameDocument("offer", "document-1", "Renamed");
    await deleteDocument("order", "document-2");
    await uploadDocument("offer", "document-3");

    expect(mocks.api).toHaveBeenNthCalledWith(1, "/api/documents/offer/document-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: "Renamed" }),
    });
    expect(mocks.api).toHaveBeenNthCalledWith(2, "/api/documents/order/document-2", {
      method: "DELETE",
    });
    expect(mocks.api).toHaveBeenNthCalledWith(3, "/api/documents/offer/document-3/upload", {
      method: "POST",
    });
  });

  it("builds the unified artifact download URL", () => {
    expect(documentDownloadUrl("order", "document-1", "pdf"))
      .toBe("https://api.example/api/documents/order/document-1/artifacts/pdf");
  });
});
