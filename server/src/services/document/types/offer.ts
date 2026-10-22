import { DocumentOwnerType, TaskTarget } from "@prisma/client";
import env from "../../../lib/env.js";
import { buildOffer } from "../../../pipelines/offer/build-offer.js";
import { offerTemplateSchema } from "../../../schemas/templates/offer.template.schema.js";
import { lockOffer } from "../../offer-acceptance.service.js";
import type { DocumentTypeDefinition } from "../document-types.js";

/** Angenommene Angebote sind dauerhaft eingefroren — samt ihrer Dokumente. */
export const offer: DocumentTypeDefinition = {
    ownerType: DocumentOwnerType.OFFER,
    taskTarget: TaskTarget.OFFER,
    ownerKey: "offerId",
    scope: "offers",
    nextcloud: {
        pdfDirectory: env.NEXTCLOUD_OFFER_PDF_PATH,
        docxDirectory: env.NEXTCLOUD_OFFER_ORIGINAL_PATH,
    },
    templateKind: "OFFER",
    renderSchema: offerTemplateSchema,
    lockOwner: lockOffer,
    frozen: { code: "OFFER_ACCEPTED", subject: "Accepted offers" },
    frozenAt: async (tx, offerId) => (await tx.offer.findUniqueOrThrow({
        where: { id: offerId },
        select: { acceptedAt: true },
    })).acceptedAt,
    currentSourceVersion: async (tx, offerId) => (await tx.offer.findUniqueOrThrow({
        where: { id: offerId },
        select: { version: true },
    })).version,
    nextDocumentVersion: async (tx, offerId) => (await tx.offer.update({
        where: { id: offerId },
        data: { documentVersion: { increment: 1 } },
        select: { documentVersion: true },
    })).documentVersion,
    build: buildOffer,
    /**
     * Ob sich Änderungen dieses Dokuments ins Angebot übernehmen lassen: nur beim
     * aktuellen Dokument des unveränderten Angebots. Wurde das Angebot nach dem
     * Erzeugen geändert (oder ist es angenommen), würde ein Wert aus der Datei
     * einen neueren Stand überschreiben.
     */
    canAdopt: async (client, documentId) => {
        const document = await client.document.findFirst({
            where: { id: documentId, type: DocumentOwnerType.OFFER },
            select: { isCurrent: true, sourceVersion: true, offer: { select: { version: true, acceptedAt: true } } },
        });
        return Boolean(document?.isCurrent)
            && document?.sourceVersion === document?.offer?.version
            && !document?.offer?.acceptedAt;
    },
};
