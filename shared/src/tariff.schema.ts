import { z } from 'zod';
import { productSchema } from './product.schema.js';
import { contractSchema } from './contract.schema.js';


/* Row */
export const tariffRowSchema = z.object({
    id: z.string(),
    tariffId: z.string(),

    min_quantity: z.number().int(),
    max_quantity: z.number().int().nullable(),

    order: z.number().int(),

    createdAt: z.string(),
    updatedAt: z.string(),
});
export type TariffRow = z.infer<typeof tariffRowSchema>;

/* Column */
export const tariffColumnSchema = z.object({
    id: z.string(),
    tariffId: z.string(),

    duration: z.number().int(),
    order: z.number().int(),

    createdAt: z.string(),
    updatedAt: z.string(),
});
export type TariffColumn = z.infer<typeof tariffColumnSchema>;

/* TariffCellDefault */
export const tariffCellDefaultSchema = z.object({
    id: z.string(),
    cellId: z.string(),

    price: z.number().int(),

    createdAt: z.string(),
    updatedAt: z.string(),
});
export type TariffCellDefault = z.infer<typeof tariffCellDefaultSchema>;

/**
 * TariffCustomerPrice — kundenspezifischer Stückpreis.
 *
 * Adressiert über die stabilen Koordinaten (duration, min_quantity) statt über
 * eine cellId, damit Overrides strukturelle Umbauten und das Wiederherstellen
 * einer Version überleben.
 */
export const tariffCustomerPriceSchema = z.object({
    id: z.string(),
    tariffId: z.string(),

    customerId: z.string(),
    productId: z.string().nullable(),

    duration: z.number().int(),
    min_quantity: z.number().int(),

    price: z.number().int(),

    createdAt: z.string(),
    updatedAt: z.string(),
});
export type TariffCustomerPrice = z.infer<typeof tariffCustomerPriceSchema>;

/* TariffCell */
export const tariffCellSchema = z.object({
    id: z.string(),
    tariffId: z.string(),

    rowId: z.string(),
    columnId: z.string(),

    default_cells: z.array(tariffCellDefaultSchema),

    createdAt: z.string(),
    updatedAt: z.string(),
});
export type TariffCell = z.infer<typeof tariffCellSchema>;

export const tariffCellListSchema = z.array(tariffCellSchema);
export type TariffCellList = z.infer<typeof tariffCellListSchema>;

/** TariffGroupProduct */
export const tariffGroupProductSchema = z.object({
    id: z.string(),
    tariffGroupId: z.string(),

    product: productSchema,
    productId: z.string(),

    createdAt: z.string(),
    updatedAt: z.string(),
});
export type TariffGroupProduct = z.infer<typeof tariffGroupProductSchema>;

/**
 * Base tariff shape shared by both the standalone tariff and the
 * tariffs nested inside a tariff group.  Neither side of the
 * Tariff ↔ TariffGroup cycle is included here to avoid circular types.
 */
const tariffBaseSchema = z.object({
    id: z.string(),

    contract: contractSchema,
    contractId: z.string(),

    tariffGroupId: z.string(),

    rows: z.array(tariffRowSchema),
    columns: z.array(tariffColumnSchema),
    cells: z.array(tariffCellSchema),
    customerPrices: z.array(tariffCustomerPriceSchema).default([]),

    createdAt: z.string(),
    updatedAt: z.string(),
});

/**
 * Slim tariff group — used as the `tariffGroup` field on a standalone
 * tariff.  Does NOT include `tariffs` (avoids the cycle).
 */
const tariffGroupSlimSchema = z.object({
    id: z.string(),

    products: z.array(tariffGroupProductSchema),

    createdAt: z.string(),
    updatedAt: z.string(),
});

/** TariffGroup (create) */
export const createTariffGroupSchema = z.object({
    products: z.array(z.string().min(1)).min(1),
});
export type CreateTariffGroupInput = z.infer<typeof createTariffGroupSchema>;

export const updateTariffGroupSchema = z.object({
    products: z.array(z.string().min(1)).optional(),
});
export type UpdateTariffGroupInput = z.infer<typeof updateTariffGroupSchema>;

/** Tariff (create) */
export const createTariffSchema = z.object({
    contractId: z.string().min(1),
});
export type CreateTariffInput = z.infer<typeof createTariffSchema>;

export const createTariffColumnSchema = z.object({
    duration: z.int(),
});
export type CreateTariffColumnInput = z.infer<typeof createTariffColumnSchema>;

export const updateTariffColumnSchema = z.object({
    duration: z.int().optional(),
});
export type UpdateTariffColumnInput = z.infer<typeof updateTariffColumnSchema>;

/** TariffRow (create) */
export const createTariffRowSchema = z.object({
    min_quantity: z.int(),
    max_quantity: z.int().nullable(),
});
export type CreateTariffRowInput = z.infer<typeof createTariffRowSchema>;

export const updateTariffRowSchema = z.object({
    min_qty: z.int().optional(),
    max_qty: z.int().nullable().optional(),
});
export type UpdateTariffRowInput = z.infer<typeof updateTariffRowSchema>;

/**
 * TariffCell (update).
 *
 * Genau eines von `default_price` / `customer_price` muss gesetzt sein; für
 * `customer_price` ist zusätzlich `customerId` erforderlich.
 */
export const updateTariffCellSchema = z.object({
    default_price: z.int().optional(),
    customer_price: z.int().optional(),
    customerId: z.string().min(1).optional(),
}).superRefine((data, ctx) => {
    if (data.customer_price !== undefined && !data.customerId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['customerId'],
            message: 'customerId is required when customer_price is set',
        });
    }
    if (data.default_price === undefined && data.customer_price === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['default_price'],
            message: 'default_price or customer_price is required',
        });
    }
});
export type UpdateTariffCellInput = z.infer<typeof updateTariffCellSchema>;

/** Kundenspezifischen Stückpreis upserten. */
export const upsertCustomerPriceSchema = z.object({
    productId: z.string().min(1),
    contractId: z.string().min(1),
    duration: z.int().positive(),
    quantity: z.int().positive(),
    customerId: z.string().min(1),
    price: z.int().nonnegative(),
});
export type UpsertCustomerPriceInput = z.infer<typeof upsertCustomerPriceSchema>;

/** Kundenspezifischen Stückpreis entfernen. */
export const deleteCustomerPriceSchema = z.object({
    productId: z.string().min(1),
    contractId: z.string().min(1),
    duration: z.int().positive(),
    quantity: z.int().positive(),
    customerId: z.string().min(1),
});
export type DeleteCustomerPriceInput = z.infer<typeof deleteCustomerPriceSchema>;

/**
 * Base tariff shape — without `tariffGroup`.
 * Used by `TariffGroup.tariffs[]`.
 */
export type TariffBase = z.infer<typeof tariffBaseSchema>;

/**
 * Standalone tariff — returned by `GET /api/tariffs/:groupId/:tariffId`.
 * Includes the slim tariff group (without nested tariffs).
 */
export const tariffSchema = tariffBaseSchema.extend({
    tariffGroup: tariffGroupSlimSchema,
});
export type Tariff = z.infer<typeof tariffSchema>;

/**
 * Tariff group — returned by `GET /api/tariffs` and `GET /api/tariffs/:id`.
 * Each nested tariff uses `tariffBaseSchema` (without `tariffGroup`).
 */
export const tariffGroupSchema = z.object({
    id: z.string(),

    products: z.array(tariffGroupProductSchema),
    tariffs: z.array(tariffBaseSchema),

    createdAt: z.string(),
    updatedAt: z.string(),
});
export type TariffGroup = z.infer<typeof tariffGroupSchema>;

/**
 * Snapshot einer Preistabelle — koordinatenbasiert, damit er unabhängig von
 * Datenbank-Ids wiederherstellbar und stabil hashbar ist.
 */
export const tariffVersionSnapshotSchema = z.object({
    columns: z.array(createTariffColumnSchema),
    rows: z.array(z.object({
        min_quantity: z.number().int(),
        max_quantity: z.number().int().nullable(),
    })),
    cells: z.array(z.object({
        duration: z.number().int(),
        min_quantity: z.number().int(),
        /** null == Zelle existiert, hat aber keinen Default-Preis */
        price: z.number().int().nullable(),
    })),
});
export type TariffVersionSnapshot = z.infer<typeof tariffVersionSnapshotSchema>;

export const tariffVersionReasonSchema = z.enum(["MANUAL", "OFFER", "RESTORE"]);
export type TariffVersionReason = z.infer<typeof tariffVersionReasonSchema>;

/** Unveränderlicher Stand einer Preistabelle. */
export const tariffVersionSchema = z.object({
    id: z.string(),
    tariffId: z.string(),

    version: z.number().int(),
    snapshotVersion: z.number().int(),

    hash: z.string(),
    snapshot: tariffVersionSnapshotSchema,
    reason: tariffVersionReasonSchema,

    createdBy: z.object({
        id: z.string(),
        name: z.string(),
    }).nullable(),

    /** Inhalt entspricht dem aktuellen Stand der Tabelle. */
    isCurrent: z.boolean(),
    /** Anzahl Angebotspositionen, die diese Version als Preisgrundlage pinnen. */
    usageCount: z.number().int(),

    createdAt: z.string(),
});
export type TariffVersion = z.infer<typeof tariffVersionSchema>;
