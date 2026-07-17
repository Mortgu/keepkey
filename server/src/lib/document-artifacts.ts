import { DocumentFormat } from "@prisma/client";

export type ArtifactWithFormat = { format: DocumentFormat };

export function findArtifact<T extends ArtifactWithFormat>(
    artifacts: T[],
    format: DocumentFormat,
): T | null {
    return artifacts.find((artifact) => artifact.format === format) ?? null;
}

export function artifactPair<T extends ArtifactWithFormat>(artifacts: T[]) {
    return {
        pdf: findArtifact(artifacts, DocumentFormat.PDF),
        docx: findArtifact(artifacts, DocumentFormat.DOCX),
    };
}
