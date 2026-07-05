import { z } from "zod";

// --- Reusable sub-schemas ---------------------------------------------------

const person = z.object({
    fullName: z.string(),
    salutation: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    email: z.string(),
});

const address = z.object({
    companyName: z.string(),
    department: z.string(),
    street: z.string(),
    zip: z.string(),
    city: z.string(),
});

// A single invoice line item (table row)
const item = z.object({
    pos: z.number(),
    articleNumber: z.string(),
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.string(), // formatted, e.g. "10,00" — analogous to price.total in the offer contract
    discount: z.string(),
    total: z.string(),
});

// --- Main contract -----------------------------------------------------------

export const invoiceContract = z.object({
    // Header fields (top right)
    invoiceNumber: z.string(),
    date: z.string(),
    paymentTerm: z.string(),
    projectNumber: z.string(),
    customerNumber: z.string(),
    supplierNumber: z.string(),
    orderNumber: z.string(),
    yourContact: person,
    ourContact: person,

    // Recipient block (top left)
    customer: address,

    // Project reference
    projectReference: z.object({
        shortDescription: z.string(),
    }),

    // Delivery/service details
    deliveryDetails: z.object({
        deliveryNoteNumber: z.string(),
        deliveryDate: z.string(),
        deliveryAddressRecipient: z.string(),
    }),

    // Line items table
    items: z.array(item),

    // Totals block
    netTotal: z.string(),
    vatRate: z.string(), // e.g. "19,00%"
    vatAmount: z.string(),
    grossTotal: z.string(),
});

export type InvoiceContext = z.infer<typeof invoiceContract>;