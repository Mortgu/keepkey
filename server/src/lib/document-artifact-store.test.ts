import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { removeDocumentArtifacts, storeDocumentArtifacts } from "./document-artifact-store.js";

describe("storeDocumentArtifacts", () => {
    let outputDirectory: string;

    beforeEach(async () => {
        outputDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "keepit-artifacts-"));
    });

    afterEach(async () => {
        await fs.rm(outputDirectory, { recursive: true, force: true });
    });

    it("speichert DOCX und PDF unter deterministischen Pfaden", async () => {
        const stored = await storeDocumentArtifacts(
            "document-1",
            Buffer.from("docx-content"),
            Buffer.from("pdf-content"),
            outputDirectory,
            "generation-1",
        );

        expect(stored.docx).toEqual({
            filename: path.join(outputDirectory, "document-1-generation-1.docx"),
            basename: "document-1-generation-1.docx",
            path: outputDirectory,
            size: 12,
        });
        expect(stored.pdf).toEqual({
            filename: path.join(outputDirectory, "document-1-generation-1.pdf"),
            basename: "document-1-generation-1.pdf",
            path: outputDirectory,
            size: 11,
        });
        expect(await fs.readFile(stored.docx.filename, "utf8")).toBe("docx-content");
        expect(await fs.readFile(stored.pdf.filename, "utf8")).toBe("pdf-content");
    });

    it("veröffentlicht parallele Versuche als unabhängige Artefaktpaare", async () => {
        const [first, second] = await Promise.all([
            storeDocumentArtifacts(
                "document-1",
                Buffer.from("first-docx"),
                Buffer.from("first-pdf"),
                outputDirectory,
                "generation-1",
            ),
            storeDocumentArtifacts(
                "document-1",
                Buffer.from("second-docx"),
                Buffer.from("second-pdf"),
                outputDirectory,
                "generation-2",
            ),
        ]);

        expect(await fs.readFile(first.docx.filename, "utf8")).toBe("first-docx");
        expect(await fs.readFile(first.pdf.filename, "utf8")).toBe("first-pdf");
        expect(await fs.readFile(second.docx.filename, "utf8")).toBe("second-docx");
        expect(await fs.readFile(second.pdf.filename, "utf8")).toBe("second-pdf");
        expect((await fs.readdir(outputDirectory)).sort()).toEqual([
            "document-1-generation-1.docx",
            "document-1-generation-1.pdf",
            "document-1-generation-2.docx",
            "document-1-generation-2.pdf",
        ]);
    });

    it("entfernt ein nicht finalisiertes Artefaktpaar", async () => {
        const stored = await storeDocumentArtifacts(
            "document-1",
            Buffer.from("docx"),
            Buffer.from("pdf"),
            outputDirectory,
            "generation-1",
        );

        await removeDocumentArtifacts(stored);

        expect(await fs.readdir(outputDirectory)).toEqual([]);
    });
});
