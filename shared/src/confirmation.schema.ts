import { z } from "zod";
import { documentArtifactSchema, documentStatusSchema } from "./document.schema.js";

/* Auftragsbestätigung (AB) — eine je Bestellung, Nummer vom Nutzer vergeben. */

export const confirmationDocumentSchema = z.object({
    id: z.string(),
    displayName: z.string().optional(),

    version: z.number(),
    sourceVersion: z.number().nullish(),

    status: documentStatusSchema,
    isCurrent: z.boolean(),
    error: z.string().nullish(),

    confirmationId: z.string(),
    taskId: z.string(),
    artifacts: z.array(documentArtifactSchema),

    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().nullish(),
});
export type ConfirmationDocument = z.infer<typeof confirmationDocumentSchema>;

export const confirmationSchema = z.object({
    id: z.string(),
    /** AB-Nr. */
    confirmationId: z.string(),
    date: z.string(),
    orderId: z.string(),
    /** Beim Anlegen festgelegt, danach fest. */
    taxRate: z.number(),
    net_cents: z.number().int(),
    vat_cents: z.number().int(),
    gross_cents: z.number().int(),
    createdById: z.string(),
    documents: z.array(confirmationDocumentSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export type Confirmation = z.infer<typeof confirmationSchema>;

const dateInput = z
    .string()
    .refine((value) => value.trim() !== "" && Number.isFinite(new Date(value).getTime()), "Invalid date");

export const createConfirmationSchema = z
    .object({
        confirmationId: z.string().trim().min(1),
        date: dateInput.optional(),
        /** Steuersatz in Prozent (0 erlaubt, z. B. Reverse-Charge). Ohne Angabe: Kundensatz. */
        taxRate: z.number().min(0).max(100).optional(),
    })
    .strict();
export type CreateConfirmationInput = z.infer<typeof createConfirmationSchema>;
