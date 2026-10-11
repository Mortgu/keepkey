import { getDocumentArtifact } from "@/lib/document-artifact-store.js";
import { AppException } from "@/lib/exceptions.js";
import { prisma } from "@/lib/prismaClient.js";
import { DocumentTemplateKind, Language } from "@keepit/schemas";

interface Props {
    kind: DocumentTemplateKind;
    language: Language;
}

export default async function loadTemplateBuffer({ kind, language }: Props): Promise<Buffer> {
    const templateObject = await prisma.documentTemplate.findFirst({
        where: {
            kind: kind,
            language: language,
            isActive: true,
        },
    });

    if (!templateObject) {
        /* TODO: Logging */
        throw new AppException(
            `Missing template file for kind ${kind} and language ${language}!`,
            404,
            "TEMPLATE_NOT_FOUND"
        );
    }

    return await getDocumentArtifact(templateObject.objectKey);
}

