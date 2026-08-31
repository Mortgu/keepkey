import { z } from 'zod';
/**
 * Global gepflegte Mengenstaffel — die Zeilenachse *aller* Preistabellen.
 * Zusammen mit {@link standardDurationSchema} spannt sie das Raster auf; ein
 * Tarif trägt nur noch die Preise an diesen Koordinaten.
 */
export declare const standardTierSchema: z.ZodObject<{
    id: z.ZodString;
    min_quantity: z.ZodNumber;
    max_quantity: z.ZodNullable<z.ZodNumber>;
    priceCount: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type StandardTier = z.infer<typeof standardTierSchema>;
export declare const standardTierListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    min_quantity: z.ZodNumber;
    max_quantity: z.ZodNullable<z.ZodNumber>;
    priceCount: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>>;
export type StandardTierList = z.infer<typeof standardTierListSchema>;
/**
 * Global gepflegte Laufzeit. Sie ist die Spaltenachse *aller* Preistabellen —
 * nur weil sie nicht am Tarif hängt, steht die Laufzeit eines Angebots fest,
 * bevor ein Produkt und damit eine Tarifgruppe gewählt ist.
 */
export declare const standardDurationSchema: z.ZodObject<{
    id: z.ZodString;
    months: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type StandardDuration = z.infer<typeof standardDurationSchema>;
export declare const standardDurationListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    months: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>>;
export type StandardDurationList = z.infer<typeof standardDurationListSchema>;
/**
 * Dieselbe Schranke wie im Versions-Snapshot: eine Laufzeit 0 ließe jedes
 * Versiegeln einer Tarif-Version scheitern.
 */
export declare const createStandardDurationSchema: z.ZodObject<{
    months: z.ZodInt;
}, z.core.$strip>;
export type CreateStandardDurationInput = z.infer<typeof createStandardDurationSchema>;
/**
 * TariffCustomerPrice — kundenspezifischer Stückpreis.
 *
 * Adressiert über die stabilen Koordinaten (duration, min_quantity) statt über
 * eine cellId, damit Overrides strukturelle Umbauten und das Wiederherstellen
 * einer Version überleben.
 */
export declare const tariffCustomerPriceSchema: z.ZodObject<{
    id: z.ZodString;
    tariffId: z.ZodString;
    customerId: z.ZodString;
    productId: z.ZodNullable<z.ZodString>;
    duration: z.ZodNumber;
    min_quantity: z.ZodNumber;
    price: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TariffCustomerPrice = z.infer<typeof tariffCustomerPriceSchema>;
/**
 * Ein Preis an seiner Koordinate. Dieselbe Schlüsselform wie
 * {@link tariffCustomerPriceSchema} und wie der Versions-Snapshot — es gibt
 * keine zweite Darstellung derselben Tabelle mehr.
 *
 * Eine Zelle ohne Preis gibt es nicht: „nicht konfiguriert" heißt, dass für
 * diese Koordinate keine Zeile existiert.
 */
export declare const tariffCellSchema: z.ZodObject<{
    id: z.ZodString;
    tariffId: z.ZodString;
    duration: z.ZodNumber;
    min_quantity: z.ZodNumber;
    price: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TariffCell = z.infer<typeof tariffCellSchema>;
export declare const tariffCellListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    tariffId: z.ZodString;
    duration: z.ZodNumber;
    min_quantity: z.ZodNumber;
    price: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>>;
export type TariffCellList = z.infer<typeof tariffCellListSchema>;
/** TariffGroupProduct */
export declare const tariffGroupProductSchema: z.ZodObject<{
    id: z.ZodString;
    tariffGroupId: z.ZodString;
    product: z.ZodObject<{
        id: z.ZodString;
        translations: z.ZodArray<z.ZodObject<{
            language: z.ZodEnum<{
                DE: "DE";
                EN: "EN";
            }>;
            name: z.ZodString;
            description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
            table: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
        }, z.core.$strip>>;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>;
    productId: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TariffGroupProduct = z.infer<typeof tariffGroupProductSchema>;
/**
 * Base tariff shape shared by both the standalone tariff and the
 * tariffs nested inside a tariff group.  Neither side of the
 * Tariff ↔ TariffGroup cycle is included here to avoid circular types.
 */
declare const tariffBaseSchema: z.ZodObject<{
    id: z.ZodString;
    contract: z.ZodObject<{
        translations: z.ZodArray<z.ZodObject<{
            language: z.ZodEnum<{
                DE: "DE";
                EN: "EN";
            }>;
            name: z.ZodString;
            features: z.ZodArray<z.ZodString>;
            table: z.ZodString;
        }, z.core.$strip>>;
        id: z.ZodString;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>;
    contractId: z.ZodString;
    tariffGroupId: z.ZodString;
    cells: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tariffId: z.ZodString;
        duration: z.ZodNumber;
        min_quantity: z.ZodNumber;
        price: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    customerPrices: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tariffId: z.ZodString;
        customerId: z.ZodString;
        productId: z.ZodNullable<z.ZodString>;
        duration: z.ZodNumber;
        min_quantity: z.ZodNumber;
        price: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
/** TariffGroup (create) */
export declare const createTariffGroupSchema: z.ZodObject<{
    products: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type CreateTariffGroupInput = z.infer<typeof createTariffGroupSchema>;
export declare const updateTariffGroupSchema: z.ZodObject<{
    products: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type UpdateTariffGroupInput = z.infer<typeof updateTariffGroupSchema>;
/** Tariff (create) */
export declare const createTariffSchema: z.ZodObject<{
    contractId: z.ZodString;
}, z.core.$strip>;
export type CreateTariffInput = z.infer<typeof createTariffSchema>;
/** Mengenstaffel (create) — gilt global, nicht je Gruppe. */
export declare const createStandardTierSchema: z.ZodObject<{
    min_quantity: z.ZodInt;
    max_quantity: z.ZodNullable<z.ZodInt>;
}, z.core.$strip>;
export type CreateStandardTierInput = z.infer<typeof createStandardTierSchema>;
export declare const updateStandardTierSchema: z.ZodObject<{
    min_quantity: z.ZodOptional<z.ZodInt>;
    max_quantity: z.ZodOptional<z.ZodNullable<z.ZodInt>>;
}, z.core.$strip>;
export type UpdateStandardTierInput = z.infer<typeof updateStandardTierSchema>;
/**
 * TariffCell (update) — setzt den Listenpreis der Zelle.
 *
 * Kundenspezifische Preise laufen ausschließlich über
 * {@link upsertCustomerPriceSchema}: sie hängen an den Koordinaten
 * (duration, min_quantity), nicht an einer cellId.
 */
export declare const updateTariffCellSchema: z.ZodObject<{
    duration: z.ZodInt;
    min_quantity: z.ZodInt;
    default_price: z.ZodInt;
}, z.core.$strip>;
export type UpdateTariffCellInput = z.infer<typeof updateTariffCellSchema>;
/**
 * TariffCell (delete) — entfernt den Preis an einer Koordinate.
 *
 * Ohne `duration` fällt die ganze Mengenstufe dieses Tarifs weg. Gebraucht wird
 * das für verwaiste Zeilen: eine Mengenstufe, die nicht mehr in den
 * Standard-Staffeln steht, trägt weiterhin Preise, und ohne Gegenstück zum
 * Upsert gäbe es keinen Weg, sie loszuwerden.
 *
 * `coerce` wie bei {@link deleteCustomerPriceSchema} — überträgt wird als
 * Query-String, dort kommt alles als String an.
 */
export declare const deleteTariffCellSchema: z.ZodObject<{
    min_quantity: z.ZodCoercedNumber<unknown>;
    duration: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type DeleteTariffCellInput = z.infer<typeof deleteTariffCellSchema>;
/** Kundenspezifischen Stückpreis upserten. */
export declare const upsertCustomerPriceSchema: z.ZodObject<{
    productId: z.ZodString;
    contractId: z.ZodString;
    duration: z.ZodInt;
    quantity: z.ZodInt;
    customerId: z.ZodString;
    price: z.ZodInt;
}, z.core.$strip>;
export type UpsertCustomerPriceInput = z.infer<typeof upsertCustomerPriceSchema>;
/**
 * Kundenspezifischen Stückpreis entfernen.
 *
 * Wird als Query-String übertragen, deshalb `coerce`: dort kommt alles als
 * String an. Ohne diese Validierung landete ein `NaN` aus `Number(…)` in der
 * Preislogik und lief dort als „keine passende Spalte" auf — mit einer
 * Fehlermeldung, die auf die falsche Ursache zeigt.
 */
export declare const deleteCustomerPriceSchema: z.ZodObject<{
    productId: z.ZodString;
    contractId: z.ZodString;
    duration: z.ZodCoercedNumber<unknown>;
    quantity: z.ZodCoercedNumber<unknown>;
    customerId: z.ZodString;
}, z.core.$strip>;
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
export declare const tariffSchema: z.ZodObject<{
    id: z.ZodString;
    contract: z.ZodObject<{
        translations: z.ZodArray<z.ZodObject<{
            language: z.ZodEnum<{
                DE: "DE";
                EN: "EN";
            }>;
            name: z.ZodString;
            features: z.ZodArray<z.ZodString>;
            table: z.ZodString;
        }, z.core.$strip>>;
        id: z.ZodString;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>;
    contractId: z.ZodString;
    tariffGroupId: z.ZodString;
    cells: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tariffId: z.ZodString;
        duration: z.ZodNumber;
        min_quantity: z.ZodNumber;
        price: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    customerPrices: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tariffId: z.ZodString;
        customerId: z.ZodString;
        productId: z.ZodNullable<z.ZodString>;
        duration: z.ZodNumber;
        min_quantity: z.ZodNumber;
        price: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    tariffGroup: z.ZodObject<{
        id: z.ZodString;
        products: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            tariffGroupId: z.ZodString;
            product: z.ZodObject<{
                id: z.ZodString;
                translations: z.ZodArray<z.ZodObject<{
                    language: z.ZodEnum<{
                        DE: "DE";
                        EN: "EN";
                    }>;
                    name: z.ZodString;
                    description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
                    table: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
                }, z.core.$strip>>;
                createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
                updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            }, z.core.$strip>;
            productId: z.ZodString;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type Tariff = z.infer<typeof tariffSchema>;
/**
 * Tariff group — returned by `GET /api/tariffs` and `GET /api/tariffs/:id`.
 * Each nested tariff uses `tariffBaseSchema` (without `tariffGroup`).
 */
export declare const tariffGroupSchema: z.ZodObject<{
    id: z.ZodString;
    products: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tariffGroupId: z.ZodString;
        product: z.ZodObject<{
            id: z.ZodString;
            translations: z.ZodArray<z.ZodObject<{
                language: z.ZodEnum<{
                    DE: "DE";
                    EN: "EN";
                }>;
                name: z.ZodString;
                description: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
                table: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | null, string | null | undefined>>;
            }, z.core.$strip>>;
            createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        }, z.core.$strip>;
        productId: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    tariffs: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        contract: z.ZodObject<{
            translations: z.ZodArray<z.ZodObject<{
                language: z.ZodEnum<{
                    DE: "DE";
                    EN: "EN";
                }>;
                name: z.ZodString;
                features: z.ZodArray<z.ZodString>;
                table: z.ZodString;
            }, z.core.$strip>>;
            id: z.ZodString;
            createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        }, z.core.$strip>;
        contractId: z.ZodString;
        tariffGroupId: z.ZodString;
        cells: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            tariffId: z.ZodString;
            duration: z.ZodNumber;
            min_quantity: z.ZodNumber;
            price: z.ZodNumber;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
        customerPrices: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            tariffId: z.ZodString;
            customerId: z.ZodString;
            productId: z.ZodNullable<z.ZodString>;
            duration: z.ZodNumber;
            min_quantity: z.ZodNumber;
            price: z.ZodNumber;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TariffGroup = z.infer<typeof tariffGroupSchema>;
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
export declare const tariffVersionSnapshotSchema: z.ZodObject<{
    columns: z.ZodArray<z.ZodObject<{
        duration: z.ZodInt;
    }, z.core.$strip>>;
    rows: z.ZodArray<z.ZodObject<{
        min_quantity: z.ZodInt;
        max_quantity: z.ZodNullable<z.ZodInt>;
    }, z.core.$strip>>;
    cells: z.ZodArray<z.ZodObject<{
        duration: z.ZodInt;
        min_quantity: z.ZodInt;
        price: z.ZodNullable<z.ZodInt>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type TariffVersionSnapshot = z.infer<typeof tariffVersionSnapshotSchema>;
export declare const tariffVersionReasonSchema: z.ZodEnum<{
    OFFER: "OFFER";
    MANUAL: "MANUAL";
    RESTORE: "RESTORE";
}>;
export type TariffVersionReason = z.infer<typeof tariffVersionReasonSchema>;
/** Unveränderlicher Stand einer Preistabelle. */
export declare const tariffVersionSchema: z.ZodObject<{
    id: z.ZodString;
    tariffId: z.ZodString;
    version: z.ZodNumber;
    snapshotVersion: z.ZodNumber;
    hash: z.ZodString;
    snapshot: z.ZodObject<{
        columns: z.ZodArray<z.ZodObject<{
            duration: z.ZodInt;
        }, z.core.$strip>>;
        rows: z.ZodArray<z.ZodObject<{
            min_quantity: z.ZodInt;
            max_quantity: z.ZodNullable<z.ZodInt>;
        }, z.core.$strip>>;
        cells: z.ZodArray<z.ZodObject<{
            duration: z.ZodInt;
            min_quantity: z.ZodInt;
            price: z.ZodNullable<z.ZodInt>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    reason: z.ZodEnum<{
        OFFER: "OFFER";
        MANUAL: "MANUAL";
        RESTORE: "RESTORE";
    }>;
    createdBy: z.ZodNullable<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, z.core.$strip>>;
    isCurrent: z.ZodBoolean;
    usageCount: z.ZodNumber;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type TariffVersion = z.infer<typeof tariffVersionSchema>;
export {};
//# sourceMappingURL=tariff.schema.d.ts.map