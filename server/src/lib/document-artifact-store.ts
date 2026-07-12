import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import env from "./env.js";

export type StoredDocumentArtifact = {
    filename: string;
    basename: string;
    path: string;
    size: number;
};

export type StoredDocumentArtifacts = {
    pdf: StoredDocumentArtifact;
    docx: StoredDocumentArtifact;
};

async function settleFileOperations(operations: Promise<unknown>[]): Promise<void> {
    const results = await Promise.allSettled(operations);
    const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => result.reason);

    if (errors.length > 0) {
        throw new AggregateError(errors, "One or more document artifact operations failed.");
    }
}

export async function storeDocumentArtifacts(
    documentId: string,
    docxBuffer: Buffer,
    pdfBuffer: Buffer,
    outputDirectory = env.OUTPUT_DIR,
    generationId: string = randomUUID(),
): Promise<StoredDocumentArtifacts> {
    await fs.mkdir(outputDirectory, { recursive: true });

    const docxBasename = `${documentId}-${generationId}.docx`;
    const pdfBasename = `${documentId}-${generationId}.pdf`;
    const docxFilename = path.join(outputDirectory, docxBasename);
    const pdfFilename = path.join(outputDirectory, pdfBasename);
    const temporaryDocx = `${docxFilename}.tmp`;
    const temporaryPdf = `${pdfFilename}.tmp`;

    try {
        await settleFileOperations([
            fs.writeFile(temporaryDocx, docxBuffer),
            fs.writeFile(temporaryPdf, pdfBuffer),
        ]);
        await settleFileOperations([
            fs.rename(temporaryDocx, docxFilename),
            fs.rename(temporaryPdf, pdfFilename),
        ]);
    } catch (error) {
        const cleanup = await Promise.allSettled([
            fs.rm(temporaryDocx, { force: true }),
            fs.rm(temporaryPdf, { force: true }),
            fs.rm(docxFilename, { force: true }),
            fs.rm(pdfFilename, { force: true }),
        ]);
        const cleanupErrors = cleanup
            .filter((result): result is PromiseRejectedResult => result.status === "rejected")
            .map((result) => result.reason);

        throw cleanupErrors.length > 0
            ? new AggregateError([error, ...cleanupErrors], "Publishing document artifacts failed and cleanup was incomplete.")
            : error;
    }

    return {
        pdf: {
            filename: pdfFilename,
            basename: pdfBasename,
            path: outputDirectory,
            size: pdfBuffer.length,
        },
        docx: {
            filename: docxFilename,
            basename: docxBasename,
            path: outputDirectory,
            size: docxBuffer.length,
        },
    };
}

export async function removeDocumentArtifacts(files: StoredDocumentArtifacts): Promise<void> {
    await settleFileOperations([
        fs.rm(files.docx.filename, { force: true }),
        fs.rm(files.pdf.filename, { force: true }),
    ]);
}
