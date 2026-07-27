import { z } from 'zod';
export declare const orderPositionSchema: z.ZodObject<{
    id: z.ZodString;
    orderId: z.ZodString;
    productId: z.ZodString;
    contractId: z.ZodString;
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
    duration_months: z.ZodNumber;
    quantity: z.ZodNumber;
    optional: z.ZodOptional<z.ZodBoolean>;
    total_cents: z.ZodNumber;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type OrderPosition = z.infer<typeof orderPositionSchema>;
export declare const orderFlatRateSchema: z.ZodObject<{
    id: z.ZodString;
    orderId: z.ZodString;
    flatRateId: z.ZodString;
    flatRate: z.ZodObject<{
        id: z.ZodString;
        total_cents: z.ZodNumber;
        translations: z.ZodArray<z.ZodObject<{
            language: z.ZodEnum<{
                DE: "DE";
                EN: "EN";
            }>;
            name: z.ZodString;
            table: z.ZodString;
        }, z.core.$strip>>;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>;
    quantity: z.ZodNumber;
    total_cents: z.ZodNumber;
}, z.core.$strip>;
export type OrderFlatRate = z.infer<typeof orderFlatRateSchema>;
export declare const orderDocumentSchema: z.ZodObject<{
    id: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    version: z.ZodNumber;
    sourceVersion: z.ZodOptional<z.ZodNumber>;
    status: z.ZodEnum<{
        PENDING: "PENDING";
        PROCESSING: "PROCESSING";
        GENERATED: "GENERATED";
        UPLOADING: "UPLOADING";
        UPLOADED: "UPLOADED";
        FAILED: "FAILED";
    }>;
    isCurrent: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
    orderId: z.ZodString;
    taskId: z.ZodString;
    artifacts: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        objectKey: z.ZodString;
        format: z.ZodEnum<{
            PDF: "PDF";
            DOCX: "DOCX";
        }>;
        size: z.ZodOptional<z.ZodNumber>;
        sha256: z.ZodOptional<z.ZodString>;
        uploadedAt: z.ZodOptional<z.ZodString>;
        remotePath: z.ZodOptional<z.ZodString>;
        remoteEtag: z.ZodOptional<z.ZodString>;
        offerDocumentId: z.ZodOptional<z.ZodString>;
        orderDocumentId: z.ZodOptional<z.ZodString>;
        updatedAt: z.ZodString;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type OrderDocument = z.infer<typeof orderDocumentSchema>;
export declare const orderRevisionSchema: z.ZodObject<{
    id: z.ZodString;
    version: z.ZodNumber;
    createdAt: z.ZodString;
    changedBy: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type OrderRevision = z.infer<typeof orderRevisionSchema>;
export declare const createOrderSchema: z.ZodObject<{
    id: z.ZodString;
    orderId: z.ZodString;
    date: z.ZodOptional<z.ZodString>;
    projectNumber: z.ZodOptional<z.ZodString>;
    projectDescription: z.ZodOptional<z.ZodString>;
    orderDetails: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export declare const updateOrderSchema: z.ZodObject<{
    expectedVersion: z.ZodNumber;
    order: z.ZodObject<{
        supplierId: z.ZodNullable<z.ZodString>;
        customerId: z.ZodString;
        contactPersonId: z.ZodString;
        employeeId: z.ZodString;
        orderId: z.ZodString;
        paymentTerm: z.ZodString;
        projectNumber: z.ZodNullable<z.ZodString>;
        projectDescription: z.ZodNullable<z.ZodString>;
        orderDetails: z.ZodNullable<z.ZodString>;
        date: z.ZodString;
        validUntil: z.ZodNullable<z.ZodString>;
        requestFrom: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>;
    positions: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        contractId: z.ZodString;
        duration_months: z.ZodNumber;
        quantity: z.ZodNumber;
        optional: z.ZodNullable<z.ZodBoolean>;
        total_cents: z.ZodNumber;
    }, z.core.$strip>>;
    flatRates: z.ZodArray<z.ZodObject<{
        flatRateId: z.ZodString;
        quantity: z.ZodNumber;
        total_cents: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export declare const restoreOrderRevisionSchema: z.ZodObject<{
    expectedVersion: z.ZodNumber;
}, z.core.$strip>;
export declare const orderSchema: z.ZodObject<{
    id: z.ZodString;
    supplierId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    customerId: z.ZodString;
    contactPersonId: z.ZodString;
    employeeId: z.ZodString;
    offerId: z.ZodString;
    orderId: z.ZodString;
    paymentTerm: z.ZodString;
    projectNumber: z.ZodOptional<z.ZodString>;
    projectDescription: z.ZodOptional<z.ZodString>;
    orderDetails: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
    validUntil: z.ZodOptional<z.ZodString>;
    requestFrom: z.ZodOptional<z.ZodString>;
    net_amount: z.ZodNumber;
    version: z.ZodNumber;
    customer: z.ZodObject<{
        id: z.ZodString;
        companyName: z.ZodString;
    }, z.core.$strip>;
    customerContactPerson: z.ZodObject<{
        id: z.ZodString;
        salutation: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
    }, z.core.$strip>;
    documents: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        version: z.ZodNumber;
        sourceVersion: z.ZodOptional<z.ZodNumber>;
        status: z.ZodEnum<{
            PENDING: "PENDING";
            PROCESSING: "PROCESSING";
            GENERATED: "GENERATED";
            UPLOADING: "UPLOADING";
            UPLOADED: "UPLOADED";
            FAILED: "FAILED";
        }>;
        isCurrent: z.ZodBoolean;
        error: z.ZodOptional<z.ZodString>;
        orderId: z.ZodString;
        taskId: z.ZodString;
        artifacts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            objectKey: z.ZodString;
            format: z.ZodEnum<{
                PDF: "PDF";
                DOCX: "DOCX";
            }>;
            size: z.ZodOptional<z.ZodNumber>;
            sha256: z.ZodOptional<z.ZodString>;
            uploadedAt: z.ZodOptional<z.ZodString>;
            remotePath: z.ZodOptional<z.ZodString>;
            remoteEtag: z.ZodOptional<z.ZodString>;
            offerDocumentId: z.ZodOptional<z.ZodString>;
            orderDocumentId: z.ZodOptional<z.ZodString>;
            updatedAt: z.ZodString;
            createdAt: z.ZodString;
        }, z.core.$strip>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        deletedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    orderPositions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        orderId: z.ZodString;
        productId: z.ZodString;
        contractId: z.ZodString;
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
        duration_months: z.ZodNumber;
        quantity: z.ZodNumber;
        optional: z.ZodOptional<z.ZodBoolean>;
        total_cents: z.ZodNumber;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
    flatRates: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        orderId: z.ZodString;
        flatRateId: z.ZodString;
        flatRate: z.ZodObject<{
            id: z.ZodString;
            total_cents: z.ZodNumber;
            translations: z.ZodArray<z.ZodObject<{
                language: z.ZodEnum<{
                    DE: "DE";
                    EN: "EN";
                }>;
                name: z.ZodString;
                table: z.ZodString;
            }, z.core.$strip>>;
            createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        }, z.core.$strip>;
        quantity: z.ZodNumber;
        total_cents: z.ZodNumber;
    }, z.core.$strip>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export type Order = z.infer<typeof orderSchema>;
export declare const orderListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    supplierId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    customerId: z.ZodString;
    contactPersonId: z.ZodString;
    employeeId: z.ZodString;
    offerId: z.ZodString;
    orderId: z.ZodString;
    paymentTerm: z.ZodString;
    projectNumber: z.ZodOptional<z.ZodString>;
    projectDescription: z.ZodOptional<z.ZodString>;
    orderDetails: z.ZodOptional<z.ZodString>;
    date: z.ZodString;
    validUntil: z.ZodOptional<z.ZodString>;
    requestFrom: z.ZodOptional<z.ZodString>;
    net_amount: z.ZodNumber;
    version: z.ZodNumber;
    customer: z.ZodObject<{
        id: z.ZodString;
        companyName: z.ZodString;
    }, z.core.$strip>;
    customerContactPerson: z.ZodObject<{
        id: z.ZodString;
        salutation: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
    }, z.core.$strip>;
    documents: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        displayName: z.ZodOptional<z.ZodString>;
        version: z.ZodNumber;
        sourceVersion: z.ZodOptional<z.ZodNumber>;
        status: z.ZodEnum<{
            PENDING: "PENDING";
            PROCESSING: "PROCESSING";
            GENERATED: "GENERATED";
            UPLOADING: "UPLOADING";
            UPLOADED: "UPLOADED";
            FAILED: "FAILED";
        }>;
        isCurrent: z.ZodBoolean;
        error: z.ZodOptional<z.ZodString>;
        orderId: z.ZodString;
        taskId: z.ZodString;
        artifacts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            objectKey: z.ZodString;
            format: z.ZodEnum<{
                PDF: "PDF";
                DOCX: "DOCX";
            }>;
            size: z.ZodOptional<z.ZodNumber>;
            sha256: z.ZodOptional<z.ZodString>;
            uploadedAt: z.ZodOptional<z.ZodString>;
            remotePath: z.ZodOptional<z.ZodString>;
            remoteEtag: z.ZodOptional<z.ZodString>;
            offerDocumentId: z.ZodOptional<z.ZodString>;
            orderDocumentId: z.ZodOptional<z.ZodString>;
            updatedAt: z.ZodString;
            createdAt: z.ZodString;
        }, z.core.$strip>>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        deletedAt: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    orderPositions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        orderId: z.ZodString;
        productId: z.ZodString;
        contractId: z.ZodString;
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
        duration_months: z.ZodNumber;
        quantity: z.ZodNumber;
        optional: z.ZodOptional<z.ZodBoolean>;
        total_cents: z.ZodNumber;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
    flatRates: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        orderId: z.ZodString;
        flatRateId: z.ZodString;
        flatRate: z.ZodObject<{
            id: z.ZodString;
            total_cents: z.ZodNumber;
            translations: z.ZodArray<z.ZodObject<{
                language: z.ZodEnum<{
                    DE: "DE";
                    EN: "EN";
                }>;
                name: z.ZodString;
                table: z.ZodString;
            }, z.core.$strip>>;
            createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        }, z.core.$strip>;
        quantity: z.ZodNumber;
        total_cents: z.ZodNumber;
    }, z.core.$strip>>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, z.core.$strip>>;
export type OrderList = z.infer<typeof orderListSchema>;
//# sourceMappingURL=order.schema.d.ts.map