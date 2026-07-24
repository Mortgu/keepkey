import { z } from "zod";

export const createOrderSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1, "Bestell-Nr. erforderlich"),
  date: z.string().optional(),
  projectNumber: z.string().optional(),
  projectDescription: z.string().optional(),
  orderDetails: z.string().optional(),
});

const orderFieldsSchema = z.object({
  supplierId: z.string().nullable(),
  customerId: z.string().min(1),
  contactPersonId: z.string().min(1),
  employeeId: z.string().min(1),
  orderId: z.string().min(1),
  paymentTerm: z.string(),
  projectNumber: z.string().nullable(),
  projectDescription: z.string().nullable(),
  orderDetails: z.string().nullable(),
  date: z.string(),
  validUntil: z.string().nullable(),
  requestFrom: z.string().nullable(),
});

const orderPositionSchema = z.object({
  productId: z.string().min(1),
  contractId: z.string().min(1),
  duration_months: z.number().int().positive(),
  quantity: z.number().int().positive(),
  optional: z.boolean().nullable(),
  total_cents: z.number().int().min(0),
});

const orderFlatRateSchema = z.object({
  flatRateId: z.string().min(1),
  quantity: z.number().int().positive(),
  total_cents: z.number().int().min(0),
});

export const updateOrderSchema = z.object({
  expectedVersion: z.number().int().positive(),
  order: orderFieldsSchema,
  positions: z.array(orderPositionSchema),
  flatRates: z.array(orderFlatRateSchema),
});

export const restoreOrderRevisionSchema = z.object({
  expectedVersion: z.number().int().positive(),
});
