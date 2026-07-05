import { z } from "zod";

const priceSchema = z.object({
  total: z.string(),
  unit: z.string().optional(),
});

const customerSchema = z.object({
  id: z.string(),
  companyName: z.string(),
  street: z.string(),
  plz: z.string(),
  city: z.string(),
  fullName: z.string(),
  salutation: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  email: z.string(),
});

const employeeSchema = z.object({
  fullName: z.string(),
  salutation: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  email: z.string(),
});

const contractSchema = z.object({
  id: z.string(),
  name: z.string(),
  features: z.array(z.string()),
  table: z.string(),
});

const productItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  table: z.string(),
  contract: contractSchema,
  duration_months: z.number(),
  duration: z.string(),
});

const groupedItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  table: z.string(),
  quantity: z.number(),
  optional: z.boolean(),
  contract: contractSchema,
  duration_months: z.number(),
  price: priceSchema,
});

const groupedSchema = z.object({
  names: z.string(),
  contract: contractSchema,
  duration_months: z.number(),
  duration: z.string(),
  total: z.string(),
  items: z.array(groupedItemSchema),
});

const productsSchema = z.object({
  names: z.string(),
  grouped: z.array(groupedSchema),
  items: z.array(productItemSchema),
});

const flatRateSchema = z.object({
  id: z.string(),
  quantity: z.number(),
  total_cents: z.number(),
  flatRate: z.object({
    id: z.string(),
    name: z.string(),
    table: z.string(),
  }),
  price: priceSchema,
});

export const offerSchema = z.object({
  quoteId: z.string(),
  date: z.string(),
  paymentTerm: z.string(),
  validUntil: z.string(),
  requestFrom: z.string(),
  supplierId: z.string(),
  customer: customerSchema,
  employee: employeeSchema,
  products: productsSchema,
  flatRates: z.array(flatRateSchema),
});

export type OfferContext = z.infer<typeof offerSchema>;
