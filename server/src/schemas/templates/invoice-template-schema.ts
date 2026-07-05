import { z } from "zod";

// --- Reusable sub-schemas ---------------------------------------------------

const address = z.object({
    street: z.string(),
    zip: z.string(),
    city: z.string(),
});

const employee = z.object({
    firstName: z.string(),
    lastName: z.string(),
    salutation: z.string(),

    phone: z.string(),
    email: z.string(),

    address: address
});

const customer = z.object({
    companyName: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    salutation: z.string(),

    phone: z.string(),
    email: z.string(),

    address: address
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

    customer: customer,
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