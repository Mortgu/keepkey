import { z } from "zod";
import { createOfferPositionSchema, createOfferSchema } from "@keepit/schemas";

export const offerModalPositionSchema = createOfferPositionSchema.extend({
    sourcePositionId: z.string().optional(),
});

export const offerModalSchema = createOfferSchema.extend({
    offerPositions: z.array(offerModalPositionSchema).min(1),
});

export type OfferModalPositionValues = z.infer<typeof offerModalPositionSchema>;
export type OfferModalValues = z.infer<typeof offerModalSchema>;
