import { z } from "zod";
import { orderTemplateSchema } from "./order.template.schema.js";

/**
 * Auftragsbestätigung: alles aus der Bestellvorlage plus AB-Nummer und den
 * Steuerblock. Beträge sind formatierte Strings wie überall in den Vorlagen.
 */
export const confirmationTemplateSchema = orderTemplateSchema.extend({
    confirmationId: z.string().min(1),
    confirmationDate: z.string(),
    netTotal: z.string(),
    /** z. B. "19,00 %" */
    vatRate: z.string(),
    vatAmount: z.string(),
    grossTotal: z.string(),
});
export type ConfirmationTemplate = z.infer<typeof confirmationTemplateSchema>;
