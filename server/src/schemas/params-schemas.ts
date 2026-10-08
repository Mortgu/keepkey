import { z } from "zod";

/**
 * Route-Parameter der ID-basierten Endpunkte. Wie bei den Dokument-Routen
 * (siehe document-schemas.ts) steht hier nur, wie IDs sich zu einem Pfad
 * fügen — die Domänen-Schemas gehören zum API-Vertrag in `@keepit/schemas`.
 */
export const idParamsSchema = z.object({
    id: z.string().min(1),
});

export const orderIdParamsSchema = z.object({
    orderId: z.string().min(1),
});

export const offerPositionParamsSchema = z.object({
    offerId: z.string().min(1),
    positionId: z.string().min(1),
});

export const customerContactParamsSchema = idParamsSchema.extend({
    contactId: z.string().min(1),
});

export const tariffParamsSchema = idParamsSchema.extend({
    tariffId: z.string().min(1),
});

export const tariffVersionParamsSchema = tariffParamsSchema.extend({
    versionId: z.string().min(1),
});
