import { z } from "zod";
import { isoDateTime } from "./common.js";
import { documentStatusSchema } from "./document.schema.js";

/**
 * Schlanke Order-Teilansicht am Angebot — nur Existenz, Nummern/Daten und der
 * Dokumentstatus (keine Artefakte). Getrennt von `orderSchema`, damit
 * `offer.schema.ts` sie einbinden kann, ohne einen Zirkelimport zu erzeugen
 * (`order.schema.ts` importiert bereits `offer.schema.ts`).
 */

const documentStatusOnlySchema = z.object({ status: documentStatusSchema });

export const offerOrderSummarySchema = z.object({
    id: z.string(),
    orderId: z.string(),
    date: isoDateTime,
    cancelledAt: isoDateTime.nullable(),
    version: z.number().int(),
    documents: z.array(documentStatusOnlySchema),
    confirmation: z.object({
        id: z.string(),
        confirmationId: z.string(),
        date: isoDateTime,
        documents: z.array(documentStatusOnlySchema),
    }).nullable(),
    invoice: z.object({
        id: z.string(),
        invoiceId: z.string(),
        date: isoDateTime,
        documents: z.array(documentStatusOnlySchema),
    }).nullable(),
});
export type OfferOrderSummary = z.infer<typeof offerOrderSummarySchema>;
