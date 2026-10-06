import { DocumentStatus, TaskTarget } from "@prisma/client";
import { storeDocumentArtifacts } from "../lib/document-artifact-store.js";
import { enqueueTask } from "../lib/document.js";
import { AppException } from "../lib/exceptions.js";
import { prisma } from "../lib/prismaClient.js";
import { renderDocument } from "../lib/render-document.js";
import { buildInvoice } from "../pipelines/invoice/build-invoice.js";
import {
    artifactsWereFinalized,
    assertDocumentCanBeGenerated,
    createArtifactDocuments,
} from "./document-generation.helpers.js";
import { deleteDocument } from "./documents.service.js";

/**
 * Rechnung erzeugen — bewusst ohne Versionierung: Es gibt immer
 * höchstens ein gültiges Dokument je Rechnung. Eine neue Anfrage löscht das alte
 * (inkl. Dateien) und legt ein frisches an.
 *
 * Zwei Funktionen, jede für sich lesbar:
 *  - `requestInvoiceGeneration` läuft im API-Prozess: Task + PENDING-
 *    Dokument anlegen, Job einreihen.
 *  - `generateInvoiceDocument` läuft im Worker: rendern, speichern,
 *    Dokument abschließen.
 */

export async function requestInvoiceGeneration(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { order: { select: { cancelledAt: true } } },
    });
    if (!invoice) throw new AppException("Invoice not found", 404, "INVOICE_NOT_FOUND");
    if (invoice.order.cancelledAt) {
        throw new AppException("Cancelled orders cannot generate documents.", 409, "ORDER_CANCELLED");
    }

    const result = await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`invoice-generation:${invoiceId}`}))::text AS "lock"`;

        // Läuft bereits eine Generierung, wird sie zurückgegeben statt verdoppelt.
        const active = await tx.invoiceDocument.findFirst({
            where: { invoiceId, deletedAt: null, status: { in: ["PENDING", "PROCESSING"] } },
            select: { task: true },
        });
        if (active) return { task: active.task, created: false, previous: [] as string[] };

        const previous = await tx.invoiceDocument.findMany({
            where: { invoiceId, deletedAt: null },
            select: { id: true },
        });

        const task = await tx.task.create({
            data: { status: "PENDING", type: "GENERATION", target: TaskTarget.INVOICE },
        });
        await tx.invoiceDocument.create({
            data: { invoiceId, status: "PENDING", taskId: task.id },
        });

        return { task, created: true, previous: previous.map((d) => d.id) };
    });

    // Alte Dokumente samt Dateien weg — außerhalb der Transaktion, weil
    // Objektspeicher und Nextcloud beteiligt sind.
    for (const id of result.previous) {
        await deleteDocument("invoice", id);
    }

    await enqueueTask(result.task.id, { markFailedOnError: result.created });

    return result.task;
}

export async function generateInvoiceDocument(taskId: string): Promise<void> {
    const document = await prisma.invoiceDocument.findFirst({
        where: { taskId, deletedAt: null },
        include: { artifacts: true },
    });
    if (!document) throw new Error(`InvoiceDocument for task ${taskId} was not found.`);
    if (!assertDocumentCanBeGenerated(document, "InvoiceDocument")) return;

    const built = await buildInvoice(document.invoiceId);
    const rendered = await renderDocument("INVOICE", built.language, built.data);

    const files = await storeDocumentArtifacts(
        "invoices",
        document.id,
        rendered.docxBuffer,
        rendered.pdfBuffer,
        taskId,
    );

    try {
        await prisma.$transaction(async (tx) => {
            await createArtifactDocuments(tx, files, { invoiceDocumentId: document.id });
            const finalized = await tx.invoiceDocument.updateMany({
                where: { id: document.id, deletedAt: null, status: DocumentStatus.PROCESSING },
                data: {
                    status: DocumentStatus.GENERATED,
                    displayName: built.displayName,
                    error: null,
                    isCurrent: true,
                },
            });
            if (finalized.count !== 1) {
                throw new Error(`InvoiceDocument ${document.id} is no longer processing.`);
            }
        });
    } catch (error) {
        const finalized = await artifactsWereFinalized(files, () => prisma.invoiceDocument.findUnique({
            where: { id: document.id },
            select: { artifacts: { select: { objectKey: true, format: true } } },
        }));
        if (!finalized) throw error;
    }
}
