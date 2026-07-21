import z from "zod";

const dateTimeSchema = z.preprocess(
  (value) => value instanceof Date ? value.toISOString() : value,
  z.string().datetime({ offset: true }),
);

const nullableDateTimeSchema = z.preprocess(
  (value) => value instanceof Date ? value.toISOString() : value,
  z.string().datetime({ offset: true }).nullable(),
);

const offerFields = z.object({
  supplierId: z.string().nullable(),
  customerId: z.string(),
  contactPersonId: z.string(),
  userId: z.string(),
  language: z.enum(["DE", "EN"]),
  quoteId: z.string(),
  paymentTerm: z.string(),
  featureComparison: z.boolean().default(false),
  date: dateTimeSchema,
  validUntil: nullableDateTimeSchema,
  requestFrom: nullableDateTimeSchema,
  net_amount: z.number().int(),
});

const offerPosition = z.object({
  productId: z.string(),
  contractId: z.string(),
  duration_months: z.number().int(),
  free_months: z.number().int().default(0),
  quantity: z.number().int(),
  optional: z.boolean().nullable().default(false),
  eur_user_month: z.number().int().optional(),
  total_cents: z.number().int(),
  discount_cents: z.number().int().default(0),
}).transform((position) => ({
  ...position,
  eur_user_month: position.eur_user_month ?? Math.trunc(
    position.total_cents / Math.max(1, position.quantity * position.duration_months),
  ),
}));

const offerFlatRate = z.object({
  flatRateId: z.string(),
  quantity: z.number().int(),
  total_cents: z.number().int(),
});

export const offerRevisionSnapshotSchema = z.object({
  offer: offerFields,
  positions: z.array(offerPosition),
  flatRates: z.array(offerFlatRate),
});

const orderFields = z.object({
  supplierId: z.string().nullable(),
  customerId: z.string(),
  contactPersonId: z.string(),
  employeeId: z.string(),
  orderId: z.string(),
  paymentTerm: z.string(),
  projectNumber: z.string().nullable(),
  projectDescription: z.string().nullable(),
  orderDetails: z.string().nullable(),
  date: dateTimeSchema,
  validUntil: nullableDateTimeSchema,
  requestFrom: nullableDateTimeSchema,
  net_amount: z.number().int(),
});

const orderPosition = z.object({
  productId: z.string(),
  contractId: z.string(),
  duration_months: z.number().int(),
  quantity: z.number().int(),
  optional: z.boolean().nullable(),
  total_cents: z.number().int(),
});

const orderFlatRate = z.object({
  flatRateId: z.string(),
  quantity: z.number().int(),
  total_cents: z.number().int(),
});

export const orderRevisionSnapshotSchema = z.object({
  order: orderFields,
  positions: z.array(orderPosition),
  flatRates: z.array(orderFlatRate),
});

export type OfferRevisionSnapshot = z.infer<typeof offerRevisionSnapshotSchema>;
export type OrderRevisionSnapshot = z.infer<typeof orderRevisionSnapshotSchema>;

export function buildOfferRevisionSnapshot(value: Record<string, unknown>): OfferRevisionSnapshot {
  return offerRevisionSnapshotSchema.parse({
    offer: value,
    positions: value.offerPositions,
    flatRates: value.offerFlatRates,
  });
}

export function parseOfferRevisionSnapshot(value: unknown): OfferRevisionSnapshot {
  if (value && typeof value === "object" && !Array.isArray(value) && !("offer" in value)) {
    return buildOfferRevisionSnapshot(value as Record<string, unknown>);
  }

  return offerRevisionSnapshotSchema.parse(value);
}

export function buildOrderRevisionSnapshot(value: Record<string, unknown>): OrderRevisionSnapshot {
  return orderRevisionSnapshotSchema.parse({
    order: value,
    positions: value.orderPositions,
    flatRates: value.flatRates,
  });
}

export function parseOrderRevisionSnapshot(value: unknown): OrderRevisionSnapshot {
  return orderRevisionSnapshotSchema.parse(value);
}
