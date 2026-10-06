import { z } from "zod";

// --- Reusable sub-schemas ---------------------------------------------------

const employee = z.object({
    firstName: z.string(),
    lastName: z.string(),
    salutation: z.string(),

    phone: z.string().nullish().transform(v => v ?? ''),
    email: z.string(),
});

export type EmployeeTemplate = z.infer<typeof employee>;

export const CustomerTemplateSchema = z.object({
    id: z.string().nullish().transform(v => v ?? ''),
    companyName: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    salutation: z.string(),
    fullName: z.string(),

    phone: z.string().nullish().transform(v => v ?? ''),
    email: z.string().nullish().transform(v => v ?? ''),

    street: z.string(),
    zip: z.string(),
    city: z.string(),
});

export type CustomerTemplate = z.infer<typeof CustomerTemplateSchema>;


// A single invoice line item (table row)
const item = z.object({
    pos: z.number(),
    description: z.string(),
    quantity: z.number(),
    /** Einzelpreis je User/Monat, formatiert. */
    unitPrice: z.string(),
    /** Brutto der Zeile vor Freimonaten/Rabatt, formatiert. */
    gross: z.string(),
    /** Abzug (Freimonate), negativ formatiert oder "". */
    discount: z.string(),
    /** Netto der Zeile, formatiert. */
    total: z.string(),
});

// --- Main contract -----------------------------------------------------------

export const invoiceContract = z.object({
    // Header fields (top right)
    invoiceNumber: z.string(),
    date: z.string(),
    paymentTerm: z.string(),
    /** Rechnungsdatum + Tage aus `paymentTerm` ("30 Tage"); "" wenn nicht ableitbar. */
    dueDate: z.string(),
    projectNumber: z.string(),
    customerNumber: z.string(),
    supplierNumber: z.string(),
    orderNumber: z.string(),
    /** AB-Nummer, falls eine Auftragsbestätigung existiert. */
    confirmationNumber: z.string(),
    /** Leistungszeitraum aus Vertragsbeginn + Laufzeit; "" ohne Vertragsbeginn. */
    servicePeriodFrom: z.string(),
    servicePeriodTo: z.string(),
    durationMonths: z.number(),
    duration: z.string(),

    customer: CustomerTemplateSchema,
    employee: employee,

    projectDescription: z.string(),
    orderDetails: z.string(),

    // Line items table
    items: z.array(item),

    // Totals block
    netTotal: z.string(),
    vatRate: z.string(), // e.g. "19,00%"
    vatAmount: z.string(),
    grossTotal: z.string(),
});

export type InvoiceContext = z.infer<typeof invoiceContract>;