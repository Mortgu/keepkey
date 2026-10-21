import { DocumentFormat, Prisma } from "@prisma/client";
import { findArtifact } from "../../lib/document-artifacts.js";
import { getDocumentArtifact } from "../../lib/document-artifact-store.js";
import { diffControls, withAdoptedValue } from "../../lib/replacement-check.js";
import { offerAdoptions } from "../../pipelines/offer/offer-adoption.js";
import { AppException } from "../../lib/exceptions.js";
import { prisma } from "../../lib/prismaClient.js";
import type { DocumentType } from "@keepit/schemas";
import { documentTable } from "../document-repo.js";
import { assertOfferEditable } from "../offer-acceptance.service.js";

/**
 * Übernimmt abweichende Feldwerte aus der abgelegten DOCX ins Angebot.
 *
 * Der Wert kommt hier aus der DOCX, nicht vom Client. Geschrieben wird nur,
 * was `offerAdoptions` kennt; ein anderes oder nicht lesbares Feld lehnt den
 * ganzen Aufruf ab, bevor etwas geändert wird. Ein Feld, das inzwischen nicht
 * mehr abweicht, wird übergangen (der Aufruf ist wiederholbar).
 *
 * Das Angebot erhält wie bei jeder Änderung eine neue Version. Das Dokument
 * bleibt das aktuelle: seine Datei enthält den Wert ja schon, es wird deshalb
 * der neuen Version zugeordnet statt als veraltet zu gelten. Nur das *aktuelle*
 * Dokument eines unveränderten Angebots darf schreiben — sonst würde ein Wert
 * aus einer älteren Datei einen neueren Stand überschreiben.
 *
 * Gesperrt sind angenommene Angebote; alle anderen Dokumenttypen kennen
 * keine Übernahme (ihre Werte sind beim Anlegen festgeschrieben).
 */
export async function adoptChanges(type: DocumentType, id: string, fields: string[]) {
    if (type !== "offer") {
        throw new AppException(
            "Änderungen lassen sich nur in Angebote übernehmen.",
            422,
            "ADOPTION_NOT_SUPPORTED",
        );
    }

    const document = await documentTable(type).requireWithArtifacts(id);
    const docx = findArtifact(document.artifacts, DocumentFormat.DOCX);
    if (!docx) throw new AppException("File not found", 404, "FILE_NOT_FOUND");
    const content = await getDocumentArtifact(docx.objectKey);

    return prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`document-model:${id}`}))::text AS "lock"`;

        // Sperrt das Angebot und lehnt angenommene ab.
        const offerId = (await tx.document.findUnique({ where: { id, type: "OFFER" }, select: { offerId: true } }))?.offerId;
        if (!offerId) throw new AppException("Document not found", 404, "DOCUMENT_NOT_FOUND");
        await assertOfferEditable(tx, offerId);

        // Wurde die Datei zwischenzeitlich ersetzt, passen die Werte oben nicht mehr.
        const current = await documentTable(type, tx).findWithArtifacts(id);
        if (findArtifact(current?.artifacts ?? [], DocumentFormat.DOCX)?.objectKey !== docx.objectKey) {
            throw new AppException("Das Dokument wurde zwischenzeitlich verändert.", 409, "DOCUMENT_STATE_CHANGED");
        }

        const [row, offer] = await Promise.all([
            tx.document.findUniqueOrThrow({ where: { id, type: "OFFER" }, select: { isCurrent: true, sourceVersion: true } }),
            tx.offer.findUniqueOrThrow({ where: { id: offerId }, select: { version: true } }),
        ]);
        if (!row.isCurrent || row.sourceVersion !== offer.version) {
            throw new AppException(
                "Das Angebot wurde nach dem Erzeugen dieses Dokuments geändert. Erzeuge das Dokument neu.",
                409,
                "DOCUMENT_NOT_CURRENT",
            );
        }

        let model: unknown = await documentTable(type, tx).readModel(id);
        if (model === null) {
            throw new AppException("Für dieses Dokument wurden keine Daten gespeichert.", 409, "MODEL_UNAVAILABLE");
        }

        const changes = new Map(diffControls(model, content).map((change) => [change.field, change]));
        const data: Prisma.OfferUpdateInput = {};
        const adopted: string[] = [];
        for (const field of new Set(fields)) {
            const change = changes.get(field);
            if (!change) continue;

            const parsed = offerAdoptions[field]?.parse(change.actual);
            const next = parsed ? withAdoptedValue(model, field, parsed.display) : null;
            if (!parsed || !next) {
                throw new AppException(
                    `„${field}“ lässt sich nicht ins Angebot übernehmen.`,
                    422,
                    "FIELD_NOT_ADOPTABLE",
                );
            }
            Object.assign(data, parsed.data);
            model = next;
            adopted.push(field);
        }

        if (adopted.length > 0) {
            const { version } = await tx.offer.update({
                where: { id: offerId },
                data: { ...data, version: { increment: 1 } },
                select: { version: true },
            });
            await tx.document.update({
                where: { id, type: "OFFER" },
                data: { model: model as Prisma.InputJsonValue, sourceVersion: version },
            });
        }
        return { adopted };
    });
}
