import { z } from "zod";
import { isoDateTime } from "./common.js";

export const activityEntitySchema = z.enum([
    "OFFER", "ORDER", "DOCUMENT", "CUSTOMER", "TARIFF"
]);
export type ActivityEntity = z.infer<typeof activityEntitySchema>;

/*
 * Anzeigefakten werden denormalisiert mitgeschrieben, damit der Feed lesbar
 * bleibt, wenn die referenzierte Entitaet spaeter geloescht wird.
 */
export const activityPayloadSchema = z.record(z.string(), z.unknown());
export type ActivityPayload = z.infer<typeof activityPayloadSchema>;

/* Server-seitiger Input fuer recordActivity — kein Wire-Format. */
export const recordActivitySchema = z.object({
    type: z.string(),
    entity: activityEntitySchema,
    entityId: z.string(),

    /* Faellt auf den Actor aus dem Request-Kontext zurueck. */
    actorId: z.string().nullish(),
    customerId: z.string().nullish(),
    payload: activityPayloadSchema.optional(),
});
export type RecordActivityInput = z.infer<typeof recordActivitySchema>;

export const activityActorSchema = z.object({
    id: z.string(),
    name: z.string(),
});
export type ActivityActor = z.infer<typeof activityActorSchema>;

export const activitySchema = z.object({
    id: z.string(),
    type: z.string(),
    entity: activityEntitySchema,
    entityId: z.string(),

    actor: activityActorSchema.nullable(),
    payload: activityPayloadSchema.default({}),

    createdAt: isoDateTime,
});
export type Activity = z.infer<typeof activitySchema>;

export const activityFilterSchema = z.object({
    entity: activityEntitySchema.optional(),
    /* Opaker Keyset-Cursor: "<iso>|<id>" */
    cursor: z.string().optional(),
    limit: z.coerce.number().int().min(1).max(100).default(30),
});
export type ActivityFilterParams = z.input<typeof activityFilterSchema>;

export const activitiesPageSchema = z.object({
    items: z.array(activitySchema),
    nextCursor: z.string().nullable(),
});
export type ActivitiesPage = z.infer<typeof activitiesPageSchema>;
