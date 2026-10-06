import { z } from "zod";
import { documentArtifactSchema, documentStatusSchema } from "./document.schema.js";

/* Rechnung — eine je Bestellung, Nummer vom Nutzer vergeben und danach fest. */

export const invoiceDocumentSchema = z.object({
    id: z.string(),
    displayName: z.string().optional(),

    version: z.number(),
    sourceVersion: z.number().nullish(),

    status: documentStatusSchema,
    isCurrent: z.boolean(),
    error: z.string().nullish(),

    invoiceId: z.string(),
    taskId: z.string(),
    artifacts: z.array(documentArtifactSchema),

    createdAt: z.string(),
    updatedAt: z.string(),
    deletedAt: z.string().nullish(),
});
export type InvoiceDocument = z.infer<typeof invoiceDocumentSchema>;

export const invoiceSchema = z.object({
    id: z.string(),
    /** Rechnungs-Nr. */
    invoiceId: z.string(),
    date: z.string(),
    orderId: z.string(),
    customerId: z.string(),
    /** Beim Anlegen festgelegt, danach fest. */
    taxRate: z.number(),
    net_cents: z.number().int(),
    vat_cents: z.number().int(),
    gross_cents: z.number().int(),
    createdById: z.string(),
    documents: z.array(invoiceDocumentSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export type Invoice = z.infer<typeof invoiceSchema>;

/** Listeneintrag mit dem Nötigsten aus Bestellung und Kunde. */
export const invoiceListItemSchema = invoiceSchema.extend({
    order: z.object({ id: z.string(), orderId: z.string(), net_amount: z.number().int() }),
    customer: z.object({ id: z.string(), companyName: z.string() }),
});
export type InvoiceListItem = z.infer<typeof invoiceListItemSchema>;

const dateInput = z
    .string()
    .refine((value) => value.trim() !== "" && Number.isFinite(new Date(value).getTime()), "Invalid date");

export const createInvoiceSchema = z
    .object({
        invoiceId: z.string().trim().min(1),
        date: dateInput.optional(),
        /** Steuersatz in Prozent (0 erlaubt, z. B. Reverse-Charge). Ohne Angabe: Kundensatz. */
        taxRate: z.number().min(0).max(100).optional(),
    })
    .strict();
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const invoiceFilterSchema = z.object({
    search: z.string().optional(),
    customerIds: z.array(z.string()).optional(),
});
export type InvoiceFilterParams = z.infer<typeof invoiceFilterSchema>;
