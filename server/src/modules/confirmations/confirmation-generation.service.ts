import { DocumentStatus, TaskTarget } from "@prisma/client";
import { storeDocumentArtifacts } from "@/modules/documents/storage/artifact-store.js";
import { enqueueTask } from "@/modules/documents/generation/enqueue-task.js";
import { AppException } from "@/core/exceptions.js";
import { prisma } from "@/core/prisma.js";
import { renderDocument } from "@/modules/documents/render/render-document.js";
import { buildConfirmation } from "./build-confirmation.js";
import {
    artifactsWereFinalized,
    assertDocumentCanBeGenerated,
    createArtifactDocuments,
} from "@/modules/documents/generation/document-generation.helpers.js";
import { deleteDocument } from "@/modules/documents/document.service.js";

/**
 * Auftragsbestätigung erzeugen — bewusst ohne Versionierung: Es gibt immer
 * höchstens ein gültiges Dokument je AB. Eine neue Anfrage löscht das alte
 * (inkl. Dateien) und legt ein frisches an.
 *
 * Zwei Funktionen, jede für sich lesbar:
 *  - `requestConfirmationGeneration` läuft im API-Prozess: Task + PENDING-
 *    Dokument anlegen, Job einreihen.
 *  - `generateConfirmationDocument` läuft im Worker: rendern, speichern,
 *    Dokument abschließen.
 */

export async function requestConfirmationGeneration(confirmationId: string) {
    const confirmation = await prisma.confirmation.findUnique({
        where: { id: confirmationId },
        include: { order: { select: { cancelledAt: true } } },
    });
    if (!confirmation) throw new AppException("Confirmation not found", 404, "CONFIRMATION_NOT_FOUND");
    if (confirmation.order.cancelledAt) {
        throw new AppException("Cancelled orders cannot generate documents.", 409, "ORDER_CANCELLED");
    }

    const result = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`confirmation-generation:${confirmationId}`}))::text AS "lock"`;

        // Läuft bereits eine Generierung, wird sie zurückgegeben statt verdoppelt.
        const active = await tx.confirmationDocument.findFirst({
            where: { confirmationId, deletedAt: null, status: { in: ["PENDING", "PROCESSING"] } },
            select: { task: true },
        });
        if (active) return { task: active.task, created: false, previous: [] as string[] };

        const previous = await tx.confirmationDocument.findMany({
            where: { confirmationId, deletedAt: null },
            select: { id: true },
        });

        const task = await tx.task.create({
            data: { status: "PENDING", type: "GENERATION", target: TaskTarget.CONFIRMATION },
        });
        await tx.confirmationDocument.create({
            data: { confirmationId, status: "PENDING", taskId: task.id },
        });

        return { task, created: true, previous: previous.map((d) => d.id) };
    });

    // Alte Dokumente samt Dateien weg — außerhalb der Transaktion, weil
    // Objektspeicher und Nextcloud beteiligt sind.
    for (const id of result.previous) {
        await deleteDocument("confirmation", id);
    }

    await enqueueTask(result.task.id, { markFailedOnError: result.created });

    return result.task;
}

export async function generateConfirmationDocument(taskId: string): Promise<void> {
    const document = await prisma.confirmationDocument.findFirst({
        where: { taskId, deletedAt: null },
        include: { artifacts: true },
    });
    if (!document) throw new Error(`ConfirmationDocument for task ${taskId} was not found.`);
    if (!assertDocumentCanBeGenerated(document, "ConfirmationDocument")) return;

    const built = await buildConfirmation(document.confirmationId);
    const rendered = await renderDocument("CONFIRMATION", built.language, built.data);

    const files = await storeDocumentArtifacts(
        "confirmations",
        document.id,
        rendered.docxBuffer,
        rendered.pdfBuffer,
        taskId,
    );

    try {
        await prisma.$transaction(async (tx) => {
            await createArtifactDocuments(tx, files, { confirmationDocumentId: document.id });
            const finalized = await tx.confirmationDocument.updateMany({
                where: { id: document.id, deletedAt: null, status: DocumentStatus.PROCESSING },
                data: {
                    status: DocumentStatus.GENERATED,
                    displayName: built.displayName,
                    error: null,
                    isCurrent: true,
                },
            });
            if (finalized.count !== 1) {
                throw new Error(`ConfirmationDocument ${document.id} is no longer processing.`);
            }
        });
    } catch (error) {
        const finalized = await artifactsWereFinalized(files, () => prisma.confirmationDocument.findUnique({
            where: { id: document.id },
            select: { artifacts: { select: { objectKey: true, format: true } } },
        }));
        if (!finalized) throw error;
    }
}
