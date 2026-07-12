import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    exists: vi.fn(),
    stat: vi.fn(),
    getFileContents: vi.fn(),
    putFileContents: vi.fn(),
}));

vi.mock("./nextcloud.js", () => ({
    getNextCloudClient: () => ({
        exists: mocks.exists,
        stat: mocks.stat,
        getFileContents: mocks.getFileContents,
        putFileContents: mocks.putFileContents,
    }),
}));

import {
    RemoteDocumentConflictError,
    sha256Document,
    uploadDocumentArtifact,
} from "./nextcloud-document-store.js";

const content = Buffer.from("document-content");
const sha256 = sha256Document(content);
const stat = {
    filename: "/pdf/document.pdf",
    basename: "document.pdf",
    lastmod: "Sun, 12 Jul 2026 13:00:00 GMT",
    size: content.length,
    type: "file" as const,
    etag: "etag-1",
};

describe("uploadDocumentArtifact", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.stat.mockResolvedValue(stat);
        mocks.getFileContents.mockResolvedValue(content);
        mocks.putFileContents.mockResolvedValue(true);
    });

    it("lädt eine fehlende Datei hoch und verifiziert ihren Inhalt", async () => {
        mocks.exists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);

        const result = await uploadDocumentArtifact("document.pdf", "/pdf", content, sha256);

        expect(mocks.putFileContents).toHaveBeenCalledWith("/pdf/document.pdf", content, {
            overwrite: false,
            headers: {
                "OC-Checksum": `SHA256:${sha256}`,
                "X-Hash": "sha256",
            },
        });
        expect(result).toMatchObject({
            remotePath: "/pdf/document.pdf",
            remoteEtag: "etag-1",
            size: content.length,
            sha256,
        });
    });

    it("behandelt identischen Remote-Inhalt als erfolgreichen Retry", async () => {
        mocks.exists.mockResolvedValue(true);

        const result = await uploadDocumentArtifact("document.pdf", "/pdf/", content, sha256);

        expect(result.sha256).toBe(sha256);
        expect(mocks.putFileContents).not.toHaveBeenCalled();
    });

    it("überschreibt abweichenden Remote-Inhalt nicht", async () => {
        mocks.exists.mockResolvedValue(true);
        mocks.getFileContents.mockResolvedValue(Buffer.from("different-content"));

        await expect(uploadDocumentArtifact("document.pdf", "/pdf", content, sha256))
            .rejects.toBeInstanceOf(RemoteDocumentConflictError);
        expect(mocks.putFileContents).not.toHaveBeenCalled();
    });

    it("erkennt einen parallelen identischen Upload bei einem abgelehnten PUT", async () => {
        mocks.exists.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
        mocks.putFileContents.mockResolvedValue(false);

        await expect(uploadDocumentArtifact("document.pdf", "/pdf", content, sha256))
            .resolves.toMatchObject({ remotePath: "/pdf/document.pdf", sha256 });
    });

    it("lehnt lokal veränderten Inhalt vor dem Netzwerkzugriff ab", async () => {
        await expect(uploadDocumentArtifact("document.pdf", "/pdf", content, "wrong-hash"))
            .rejects.toThrow("does not match its stored SHA-256 checksum");
        expect(mocks.exists).not.toHaveBeenCalled();
    });
});
