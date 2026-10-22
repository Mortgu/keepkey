import type { DocumentOwnerType, DocumentTemplateKind, Language, Prisma, TaskTarget } from "@prisma/client";
import type { DocumentType } from "@keepit/schemas";
import type { z } from "zod";
import type { DocumentArtifactScope } from "../../lib/document-artifact-store.js";
import { offer } from "./types/offer.js";
import { order } from "./types/order.js";
import { confirmation } from "./types/confirmation.js";
import { invoice } from "./types/invoice.js";

/** Die nullbare Eltern-Spalte in document_record, die zu einem Dokumenttyp gehört. */
export type DocumentOwnerKey = "offerId" | "orderId" | "confirmationId" | "invoiceId";

/**
 * Alles, worin sich die Dokumenttypen unterscheiden — an einem Ort. Anfordern,
 * Generieren, Lebenszyklus und Worker lesen nur hieraus; ein neuer Dokumenttyp
 * ist eine weitere Definition in `types/`.
 *
 * `ownerId` ist immer die ID des Eigentümers (Offer, Order, Confirmation, Invoice),
 * nie die des Dokuments.
 */
export type DocumentTypeDefinition = {
    ownerType: DocumentOwnerType;
    taskTarget: TaskTarget;
    ownerKey: DocumentOwnerKey;
    scope: DocumentArtifactScope;
    nextcloud: { pdfDirectory: string; docxDirectory: string };
    templateKind: DocumentTemplateKind;
    renderSchema?: z.ZodType;
    /**
     * Nimmt innerhalb der Transaktion den Lock, der jede Änderung an dem
     * serialisiert, wogegen das Dokument eingefroren oder veraltet sein kann.
     * Wirft 404, wenn es den Eigentümer nicht gibt.
     */
    lockOwner: (tx: Prisma.TransactionClient, ownerId: string) => Promise<void>;
    /** Fehlercode und Subjekt der Meldung; den Wortlaut der Aktion ergänzt der Aufrufer. */
    frozen: { code: string; subject: string };
    frozenAt: (tx: Prisma.TransactionClient, ownerId: string) => Promise<Date | null>;
    /**
     * `null`, wenn es für diesen Typ nichts gibt, wogegen eine Generierung
     * veralten könnte (Confirmation, Invoice: Konditionen sind ab Anlage
     * unveränderlich, ADR-0001).
     */
    currentSourceVersion: (tx: Prisma.TransactionClient, ownerId: string) => Promise<number | null>;
    nextDocumentVersion: (tx: Prisma.TransactionClient, ownerId: string) => Promise<number>;
    /** Vorlagendaten und Namen ohne Version — die hängt `runGeneration` für alle Typen gleich an. */
    build: (ownerId: string) => Promise<{ language: Language; data: Record<string, unknown>; baseName: string }>;
    /** Nur Angebote können Änderungen aus einer ersetzten DOCX übernehmen. */
    canAdopt?: (client: Prisma.TransactionClient, documentId: string) => Promise<boolean>;
};

export const documentTypes: Record<DocumentType, DocumentTypeDefinition> = {
    offer,
    order,
    confirmation,
    invoice,
};

/** `undefined` für Task-Ziele ohne Dokument (`RENEWAL`). */
export function documentTypeForTarget(target: TaskTarget): DocumentType | undefined {
    return (Object.keys(documentTypes) as DocumentType[]).find((type) => documentTypes[type].taskTarget === target);
}

export function documentTypeForOwnerType(ownerType: DocumentOwnerType): DocumentType {
    const type = (Object.keys(documentTypes) as DocumentType[]).find((key) => documentTypes[key].ownerType === ownerType);
    if (!type) throw new Error(`No document type for owner type ${ownerType}.`);
    return type;
}

/** Die Eltern-Spalte als `where`-/`data`-Fragment. */
export function ownerColumn(key: DocumentOwnerKey, ownerId: string): Partial<Record<DocumentOwnerKey, string>> {
    return { [key]: ownerId };
}
