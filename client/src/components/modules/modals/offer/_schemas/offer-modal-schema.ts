import { z } from "zod";
import { createOfferPositionSchema, createOfferSchema } from "@keepit/schemas";

/**
 * Formularschema des Angebots-Modals.
 *
 * Deckungsgleich mit `createOfferSchema`, nur trägt jede Position zusätzlich die
 * ID ihrer Quellposition. Die Lizenzerweiterung schickt statt der Positionsdaten
 * `sourcePositionId`-Verweise ans Backend — hinge diese Zuordnung wie früher am
 * Array-Index, verschöbe sie sich, sobald eine Position entfernt wird. Dasselbe
 * Feld liefert den Pin für die angepinnte Preisabfrage.
 *
 * Die Submit-Mapper projizieren die Werte in die jeweilige Nutzlast, das Feld
 * verlässt den Client also nie.
 */
export const offerModalPositionSchema = createOfferPositionSchema.extend({
    sourcePositionId: z.string().optional(),
});

export const offerModalSchema = createOfferSchema.extend({
    offerPositions: z.array(offerModalPositionSchema).min(1),
});

export type OfferModalPositionValues = z.infer<typeof offerModalPositionSchema>;
export type OfferModalValues = z.infer<typeof offerModalSchema>;
