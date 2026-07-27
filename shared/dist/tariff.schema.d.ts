import { z } from 'zod';
export declare const tariffRowSchema: z.ZodObject<{
    id: z.ZodString;
    tariffId: z.ZodString;
    min_quantity: z.ZodNumber;
    max_quantity: z.ZodNullable<z.ZodNumber>;
    order: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TariffRow = z.infer<typeof tariffRowSchema>;
export declare const tariffColumnSchema: z.ZodObject<{
    id: z.ZodString;
    tariffId: z.ZodString;
    duration: z.ZodNumber;
    order: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TariffColumn = z.infer<typeof tariffColumnSchema>;
export declare const tariffCellDefaultSchema: z.ZodObject<{
    id: z.ZodString;
    cellId: z.ZodString;
    price: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TariffCellDefault = z.infer<typeof tariffCellDefaultSchema>;
export declare const tariffCellCustomerSchema: z.ZodObject<{
    id: z.ZodString;
    cellId: z.ZodString;
    customerId: z.ZodString;
    productId: z.ZodNullable<z.ZodString>;
    price: z.ZodNumber;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TariffCellCustomer = z.infer<typeof tariffCellCustomerSchema>;
export declare const tariffCellSchema: z.ZodObject<{
    id: z.ZodString;
    tariffId: z.ZodString;
    rowId: z.ZodString;
    columnId: z.ZodString;
    default_cells: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        cellId: z.ZodString;
        price: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    customer_cells: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        cellId: z.ZodString;
        customerId: z.ZodString;
        productId: z.ZodNullable<z.ZodString>;
        price: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TariffCell = z.infer<typeof tariffCellSchema>;
export declare const tariffCellListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    tariffId: z.ZodString;
    rowId: z.ZodString;
    columnId: z.ZodString;
    default_cells: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        cellId: z.ZodString;
        price: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    customer_cells: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        cellId: z.ZodString;
        customerId: z.ZodString;
        productId: z.ZodNullable<z.ZodString>;
        price: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
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
    rows: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tariffId: z.ZodString;
        min_quantity: z.ZodNumber;
        max_quantity: z.ZodNullable<z.ZodNumber>;
        order: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    columns: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tariffId: z.ZodString;
        duration: z.ZodNumber;
        order: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    cells: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tariffId: z.ZodString;
        rowId: z.ZodString;
        columnId: z.ZodString;
        default_cells: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            cellId: z.ZodString;
            price: z.ZodNumber;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
        customer_cells: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            cellId: z.ZodString;
            customerId: z.ZodString;
            productId: z.ZodNullable<z.ZodString>;
            price: z.ZodNumber;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
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
/**
 * Base tariff shape — without `tariffGroup`.
 * Used by `TariffGroup.tariffs[]` and `TariffHistory.snapshot`.
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
    rows: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tariffId: z.ZodString;
        min_quantity: z.ZodNumber;
        max_quantity: z.ZodNullable<z.ZodNumber>;
        order: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    columns: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tariffId: z.ZodString;
        duration: z.ZodNumber;
        order: z.ZodNumber;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    cells: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tariffId: z.ZodString;
        rowId: z.ZodString;
        columnId: z.ZodString;
        default_cells: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            cellId: z.ZodString;
            price: z.ZodNumber;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
        customer_cells: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            cellId: z.ZodString;
            customerId: z.ZodString;
            productId: z.ZodNullable<z.ZodString>;
            price: z.ZodNumber;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
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
        rows: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            tariffId: z.ZodString;
            min_quantity: z.ZodNumber;
            max_quantity: z.ZodNullable<z.ZodNumber>;
            order: z.ZodNumber;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
        columns: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            tariffId: z.ZodString;
            duration: z.ZodNumber;
            order: z.ZodNumber;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
        cells: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            tariffId: z.ZodString;
            rowId: z.ZodString;
            columnId: z.ZodString;
            default_cells: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                cellId: z.ZodString;
                price: z.ZodNumber;
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            }, z.core.$strip>>;
            customer_cells: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                cellId: z.ZodString;
                customerId: z.ZodString;
                productId: z.ZodNullable<z.ZodString>;
                price: z.ZodNumber;
                createdAt: z.ZodString;
                updatedAt: z.ZodString;
            }, z.core.$strip>>;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, z.core.$strip>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, z.core.$strip>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type TariffGroup = z.infer<typeof tariffGroupSchema>;
export declare const tariffHistorySchema: z.ZodObject<{
    id: z.ZodString;
    productId: z.ZodString;
    contractId: z.ZodString;
    version: z.ZodNumber;
    snapshot: z.ZodUnknown;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type TariffHistory = z.infer<typeof tariffHistorySchema>;
export {};
//# sourceMappingURL=tariff.schema.d.ts.map