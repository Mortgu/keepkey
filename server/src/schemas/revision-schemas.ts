import { z } from "zod";

const dateTimeSchema = z.preprocess(
  (value) => value instanceof Date ? value.toISOString() : value,
  z.string().datetime({ offset: true }),
);

const nullableDateTimeSchema = z.preprocess(
  (value) => value instanceof Date ? value.toISOString() : value,
  z.string().datetime({ offset: true }).nullable(),
);

/**
 * Snapshot-Format 2: Vertrag und Laufzeit stehen am Beleg statt an der Position.
 *
 * Version 1 wird weiterhin gelesen — die bestehenden Revisionen sind sonst
 * unwiederherstellbar. Umgestellt wird beim Lesen, nicht in der Datenbank:
 * gespeicherte Snapshots sind unveraenderlich.
 */
export const OFFER_REVISION_SNAPSHOT_VERSION = 2;
export const ORDER_REVISION_SNAPSHOT_VERSION = 2;

const offerFields = z.object({
  supplierId: z.string().nullable(),
  customerId: z.string(),
  contactPersonId: z.string(),
  userId: z.string(),
  language: z.enum(["DE", "EN"]),
  contractId: z.string(),
  duration_months: z.number().int(),
  quoteId: z.string(),
  paymentTerm: z.string(),
  featureComparison: z.boolean().default(false),
  date: dateTimeSchema,
  validUntil: nullableDateTimeSchema,
  requestFrom: nullableDateTimeSchema,
  net_amount: z.number().int(),
});

/**
 * Der Stueckpreis wird nur noch aus dem Snapshot uebernommen, nicht mehr
 * hilfsweise aus `total_cents / (quantity * duration_months)` gerechnet: die
 * Laufzeit steht nicht mehr an der Position. Fuer v1-Snapshots passiert diese
 * Herleitung weiterhin — dort ist sie moeglich (siehe {@link offerPositionV1}).
 */
const offerPosition = z.object({
  productId: z.string(),
  free_months: z.number().int().default(0),
  quantity: z.number().int(),
  optional: z.boolean(),
  eur_user_month: z.number().int(),
  total_cents: z.number().int(),
  discount_cents: z.number().int().default(0),
  // Muss im Snapshot mitgeführt werden, sonst verliert ein Restore die
  // angepinnte Preisgrundlage (z.object strippt unbekannte Keys).
  tariffVersionId: z.string().nullable().default(null),
});

const offerFlatRate = z.object({
  flatRateId: z.string(),
  quantity: z.number().int(),
  total_cents: z.number().int(),
});

const offerDiscount = z.object({
  title: z.string(),
  description: z.string().nullable().default(null),
  amount_cents: z.number().int(),
});

export const offerRevisionSnapshotSchema = z.object({
  offer: offerFields,
  positions: z.array(offerPosition),
  flatRates: z.array(offerFlatRate),
  discounts: z.array(offerDiscount).default([]),
});

const orderFields = z.object({
  supplierId: z.string().nullable(),
  customerId: z.string(),
  contactPersonId: z.string(),
  employeeId: z.string(),
  contractId: z.string(),
  duration_months: z.number().int(),
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
  quantity: z.number().int(),
  optional: z.boolean(),
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

/* ========== Version 1 — nur noch lesend ==========
 *
 * In v1 trug jede Position ihren eigenen Vertrag und ihre eigene Laufzeit. Beim
 * Lesen werden sie an den Kopf gehoben. Das ist verlustfrei, weil fachlich
 * ohnehin alle Positionen eines Belegs dieselben Werte trugen — dieselbe
 * Annahme, unter der die Datenbankmigration den Backfill gemacht hat. */

const offerPositionV1 = z.object({
  productId: z.string(),
  contractId: z.string(),
  duration_months: z.number().int(),
  free_months: z.number().int().default(0),
  quantity: z.number().int(),
  optional: z.boolean(),
  eur_user_month: z.number().int().optional(),
  total_cents: z.number().int(),
  discount_cents: z.number().int().default(0),
  tariffVersionId: z.string().nullable().default(null),
}).transform((position) => ({
  ...position,
  // Altbestand aus der Zeit vor `eur_user_month`: dort ist der Stueckpreis nur
  // noch aus dem Gesamtpreis herleitbar.
  eur_user_month: position.eur_user_month ?? Math.trunc(
    position.total_cents / Math.max(1, position.quantity * position.duration_months),
  ),
}));

const offerRevisionSnapshotSchemaV1 = z.object({
  offer: offerFields.omit({ contractId: true, duration_months: true }),
  positions: z.array(offerPositionV1),
  flatRates: z.array(offerFlatRate),
  discounts: z.array(offerDiscount).default([]),
});

const orderPositionV1 = orderPosition.extend({
  contractId: z.string(),
  duration_months: z.number().int(),
});

const orderRevisionSnapshotSchemaV1 = z.object({
  order: orderFields.omit({ contractId: true, duration_months: true }),
  positions: z.array(orderPositionV1),
  flatRates: z.array(orderFlatRate),
});

/**
 * Hebt Vertrag und Laufzeit der ersten Position an den Kopf.
 *
 * Ohne Position gibt es nichts zu heben — ein solcher Snapshot laesst sich im
 * neuen Modell nicht darstellen und wird abgelehnt, statt mit einem beliebigen
 * Vertrag aufgefuellt zu werden.
 */
function hoistHeader<P extends { contractId: string; duration_months: number }>(
  positions: P[],
  label: string,
): { contractId: string; duration_months: number } {
  const first = positions[0];

  if (!first) {
    throw new Error(`${label}: Snapshot ohne Positionen kann keinen Vertrag erben.`);
  }

  return { contractId: first.contractId, duration_months: first.duration_months };
}

function upgradeOfferSnapshotV1(
  v1: z.infer<typeof offerRevisionSnapshotSchemaV1>,
): OfferRevisionSnapshot {
  const header = hoistHeader(v1.positions, "Angebotsrevision");

  return {
    offer: { ...v1.offer, ...header },
    positions: v1.positions.map(({ contractId: _c, duration_months: _d, ...position }) => position),
    flatRates: v1.flatRates,
    discounts: v1.discounts,
  };
}

function upgradeOrderSnapshotV1(
  v1: z.infer<typeof orderRevisionSnapshotSchemaV1>,
): OrderRevisionSnapshot {
  const header = hoistHeader(v1.positions, "Bestellrevision");

  return {
    order: { ...v1.order, ...header },
    positions: v1.positions.map(({ contractId: _c, duration_months: _d, ...position }) => position),
    flatRates: v1.flatRates,
  };
}

/* ========== Bauen und Lesen ========== */

export function buildOfferRevisionSnapshot(value: Record<string, unknown>): OfferRevisionSnapshot {
  return offerRevisionSnapshotSchema.parse({
    offer: value,
    positions: value.offerPositions,
    flatRates: value.offerFlatRates,
    discounts: value.offerDiscounts,
  });
}

/**
 * `snapshotVersion` kommt aus der Revision selbst. Ohne Angabe wird das
 * aktuelle Format erwartet.
 */
export function parseOfferRevisionSnapshot(value: unknown, snapshotVersion = OFFER_REVISION_SNAPSHOT_VERSION): OfferRevisionSnapshot {
  if (snapshotVersion === 1) {
    // Aelteste Form: der rohe Angebotsdatensatz ohne die Huelle mit `offer`.
    const wrapped = value && typeof value === "object" && !Array.isArray(value) && !("offer" in value)
      ? {
        offer: value,
        positions: (value as Record<string, unknown>).offerPositions,
        flatRates: (value as Record<string, unknown>).offerFlatRates,
        discounts: (value as Record<string, unknown>).offerDiscounts,
      }
      : value;

    return upgradeOfferSnapshotV1(offerRevisionSnapshotSchemaV1.parse(wrapped));
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

export function parseOrderRevisionSnapshot(value: unknown, snapshotVersion = ORDER_REVISION_SNAPSHOT_VERSION): OrderRevisionSnapshot {
  if (snapshotVersion === 1) {
    return upgradeOrderSnapshotV1(orderRevisionSnapshotSchemaV1.parse(value));
  }

  return orderRevisionSnapshotSchema.parse(value);
}
