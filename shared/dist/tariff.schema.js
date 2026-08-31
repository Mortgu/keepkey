import { z } from 'zod';
import { productSchema } from './product.schema.js';
import { contractSchema } from './contract.schema.js';
/**
 * Global gepflegte Mengenstaffel — die Zeilenachse *aller* Preistabellen.
 * Zusammen mit {@link standardDurationSchema} spannt sie das Raster auf; ein
 * Tarif trägt nur noch die Preise an diesen Koordinaten.
 */
export const standardTierSchema = z.object({
    id: z.string(),
    min_quantity: z.number().int(),
    max_quantity: z.number().int().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export const standardTierListSchema = z.array(standardTierSchema);
/**
 * Global gepflegte Laufzeit. Sie ist die Spaltenachse *aller* Preistabellen —
 * nur weil sie nicht am Tarif hängt, steht die Laufzeit eines Angebots fest,
 * bevor ein Produkt und damit eine Tarifgruppe gewählt ist.
 */
export const standardDurationSchema = z.object({
    id: z.string(),
    /** Laufzeit in Monaten. == TariffCell.duration */
    months: z.number().int(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export const standardDurationListSchema = z.array(standardDurationSchema);
/**
 * Dieselbe Schranke wie im Versions-Snapshot: eine Laufzeit 0 ließe jedes
 * Versiegeln einer Tarif-Version scheitern.
 */
export const createStandardDurationSchema = z.object({
    months: z.int().positive(),
});
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
/**
 * Ein Preis an seiner Koordinate. Dieselbe Schlüsselform wie
 * {@link tariffCustomerPriceSchema} und wie der Versions-Snapshot — es gibt
 * keine zweite Darstellung derselben Tabelle mehr.
 *
 * Eine Zelle ohne Preis gibt es nicht: „nicht konfiguriert" heißt, dass für
 * diese Koordinate keine Zeile existiert.
 */
export const tariffCellSchema = z.object({
    id: z.string(),
    tariffId: z.string(),
    duration: z.number().int(),
    min_quantity: z.number().int(),
    price: z.number().int(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export const tariffCellListSchema = z.array(tariffCellSchema);
/** TariffGroupProduct */
export const tariffGroupProductSchema = z.object({
    id: z.string(),
    tariffGroupId: z.string(),
    product: productSchema,
    productId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
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
export const updateTariffGroupSchema = z.object({
    products: z.array(z.string().min(1)).optional(),
});
/** Tariff (create) */
export const createTariffSchema = z.object({
    contractId: z.string().min(1),
});
/** Mengenstaffel (create) — gilt global, nicht je Gruppe. */
export const createStandardTierSchema = z.object({
    min_quantity: z.int().positive(),
    max_quantity: z.int().positive().nullable(),
});
export const updateStandardTierSchema = z.object({
    min_quantity: z.int().positive().optional(),
    max_quantity: z.int().positive().nullable().optional(),
});
/**
 * TariffCell (update) — setzt den Listenpreis der Zelle.
 *
 * Kundenspezifische Preise laufen ausschließlich über
 * {@link upsertCustomerPriceSchema}: sie hängen an den Koordinaten
 * (duration, min_quantity), nicht an einer cellId.
 */
export const updateTariffCellSchema = z.object({
    duration: z.int().positive(),
    min_quantity: z.int().positive(),
    default_price: z.int(),
});
/** Kundenspezifischen Stückpreis upserten. */
export const upsertCustomerPriceSchema = z.object({
    productId: z.string().min(1),
    contractId: z.string().min(1),
    duration: z.int().positive(),
    quantity: z.int().positive(),
    customerId: z.string().min(1),
    price: z.int().nonnegative(),
});
/**
 * Kundenspezifischen Stückpreis entfernen.
 *
 * Wird als Query-String übertragen, deshalb `coerce`: dort kommt alles als
 * String an. Ohne diese Validierung landete ein `NaN` aus `Number(…)` in der
 * Preislogik und lief dort als „keine passende Spalte" auf — mit einer
 * Fehlermeldung, die auf die falsche Ursache zeigt.
 */
export const deleteCustomerPriceSchema = z.object({
    productId: z.string().min(1),
    contractId: z.string().min(1),
    duration: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
    customerId: z.string().min(1),
});
/**
 * Standalone tariff — returned by `GET /api/tariffs/:groupId/:tariffId`.
 * Includes the slim tariff group (without nested tariffs).
 */
export const tariffSchema = tariffBaseSchema.extend({
    tariffGroup: tariffGroupSlimSchema,
});
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
/**
 * Snapshot einer Preistabelle — koordinatenbasiert, damit er unabhängig von
 * Datenbank-Ids wiederherstellbar und stabil hashbar ist.
 *
 * **Die einzige Definition dieser Form.** Sie beschreibt zugleich, was der
 * Server in `TariffVersion.snapshot` schreibt und liest, und was der Client in
 * der API-Antwort bekommt. Solange beides von hier kommt, können die Schranken
 * nicht auseinanderlaufen.
 *
 * Alle Koordinaten sind positiv: eine Laufzeit oder Mengenuntergrenze von 0
 * ergibt fachlich keinen Sinn und würde beim Wiederherstellen eine Zeile bzw.
 * Spalte erzeugen, die keine Preisabfrage mehr trifft.
 */
export const tariffVersionSnapshotSchema = z.object({
    /* Inline statt aus einem Input-Schema: die Snapshot-Form darf sich nicht
       mitbewegen, wenn sich die Eingabeschemata ändern — sonst kippt der Hash
       und mit ihm die Preisgrundlage jeder angepinnten Position. */
    columns: z.array(z.object({ duration: z.int().positive() })),
    rows: z.array(z.object({
        min_quantity: z.int().positive(),
        max_quantity: z.int().positive().nullable(),
    })),
    cells: z.array(z.object({
        duration: z.int().positive(),
        min_quantity: z.int().positive(),
        /** null == Zelle existiert, hat aber keinen Default-Preis */
        price: z.int().nullable(),
    })),
});
export const tariffVersionReasonSchema = z.enum(["MANUAL", "OFFER", "RESTORE"]);
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
//# sourceMappingURL=tariff.schema.js.map