import { z } from "zod";
export declare const createOfferPositionSchema: z.ZodObject<{
    productId: z.ZodString;
    contractId: z.ZodString;
    free_months: z.ZodNumber;
    optional: z.ZodBoolean;
    quantity: z.ZodNumber;
    total_cents: z.ZodNumber;
    duration_months: z.ZodNumber;
    discount_cents: z.ZodNumber;
    eur_user_month: z.ZodNumber;
}, z.core.$strip>;
export type CreateOfferPositionInput = z.infer<typeof createOfferPositionSchema>;
export declare const updateOfferPositionSchema: z.ZodObject<{
    productId: z.ZodOptional<z.ZodString>;
    contractId: z.ZodOptional<z.ZodString>;
    free_months: z.ZodOptional<z.ZodNumber>;
    optional: z.ZodOptional<z.ZodBoolean>;
    quantity: z.ZodOptional<z.ZodNumber>;
    total_cents: z.ZodOptional<z.ZodNumber>;
    duration_months: z.ZodOptional<z.ZodNumber>;
    discount_cents: z.ZodOptional<z.ZodNumber>;
    eur_user_month: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type UpdateOfferPositionInput = z.infer<typeof updateOfferPositionSchema>;
export declare const offerPositionSchema: z.ZodObject<{
    productId: z.ZodString;
    contractId: z.ZodString;
    free_months: z.ZodNumber;
    optional: z.ZodBoolean;
    quantity: z.ZodNumber;
    total_cents: z.ZodNumber;
    duration_months: z.ZodNumber;
    discount_cents: z.ZodNumber;
    eur_user_month: z.ZodNumber;
    id: z.ZodString;
    offerId: z.ZodString;
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
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>;
export type OfferPosition = z.infer<typeof offerPositionSchema>;
export declare const createOfferFlatrateSchema: z.ZodObject<{
    flatRateId: z.ZodString;
    quantity: z.ZodNumber;
}, z.core.$strip>;
export type CreateOfferFlatrateInput = z.infer<typeof createOfferFlatrateSchema>;
export declare const updateOfferFlatrateSchema: z.ZodObject<{
    flatRateId: z.ZodOptional<z.ZodString>;
    quantity: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type UpdateOfferFlatrateInput = z.infer<typeof updateOfferFlatrateSchema>;
export declare const offerFlatrateSchema: z.ZodObject<{
    flatRateId: z.ZodString;
    quantity: z.ZodNumber;
    id: z.ZodString;
    offerId: z.ZodString;
    total_cents: z.ZodNumber;
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
}, z.core.$strip>;
export type OfferFlatrate = z.infer<typeof offerFlatrateSchema>;
export declare const createOfferDiscountSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    amount_cents: z.ZodNumber;
}, z.core.$strip>;
export type CreateOfferDiscountInput = z.infer<typeof createOfferDiscountSchema>;
export declare const updateOfferDiscountSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    amount_cents: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type updateOfferDiscountInput = z.infer<typeof updateOfferDiscountSchema>;
export declare const createOfferDocumentSchema: z.ZodObject<{}, z.core.$strip>;
export type CreateOfferDocumentInput = z.infer<typeof createOfferDocumentSchema>;
export declare const updateOfferDocumentSchema: z.ZodObject<{}, z.core.$strip>;
export type UpdateOfferDocumentInput = z.infer<typeof updateOfferDocumentSchema>;
export declare const offerDocumentSchema: z.ZodObject<{
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
    offerId: z.ZodString;
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
    taskId: z.ZodString;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>;
export type OfferDocument = z.infer<typeof offerDocumentSchema>;
export declare const offerRevisionSchema: z.ZodObject<{
    id: z.ZodString;
    version: z.ZodNumber;
    createdAt: z.ZodString;
    changedBy: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type OfferRevision = z.infer<typeof offerRevisionSchema>;
export declare const createOfferSchema: z.ZodObject<{
    customerId: z.ZodString;
    contactPersonId: z.ZodString;
    userId: z.ZodString;
    supplierId: z.ZodNullable<z.ZodString>;
    quoteId: z.ZodString;
    paymentTerm: z.ZodString;
    validUntil: z.ZodNullable<z.ZodString>;
    requestFrom: z.ZodNullable<z.ZodString>;
    language: z.ZodEnum<{
        DE: "DE";
        EN: "EN";
    }>;
    featureComparison: z.ZodBoolean;
    toCompare: z.ZodArray<z.ZodString>;
    offerPositions: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        contractId: z.ZodString;
        free_months: z.ZodNumber;
        optional: z.ZodBoolean;
        quantity: z.ZodNumber;
        total_cents: z.ZodNumber;
        duration_months: z.ZodNumber;
        discount_cents: z.ZodNumber;
        eur_user_month: z.ZodNumber;
    }, z.core.$strip>>;
    flatrates: z.ZodArray<z.ZodObject<{
        flatRateId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    discounts: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        amount_cents: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export declare const updateOfferSchema: z.ZodObject<{
    customerId: z.ZodString;
    contactPersonId: z.ZodString;
    userId: z.ZodString;
    supplierId: z.ZodNullable<z.ZodString>;
    quoteId: z.ZodString;
    paymentTerm: z.ZodString;
    validUntil: z.ZodNullable<z.ZodString>;
    requestFrom: z.ZodNullable<z.ZodString>;
    language: z.ZodEnum<{
        DE: "DE";
        EN: "EN";
    }>;
    featureComparison: z.ZodBoolean;
    toCompare: z.ZodArray<z.ZodString>;
    offerPositions: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        contractId: z.ZodString;
        free_months: z.ZodNumber;
        optional: z.ZodBoolean;
        quantity: z.ZodNumber;
        total_cents: z.ZodNumber;
        duration_months: z.ZodNumber;
        discount_cents: z.ZodNumber;
        eur_user_month: z.ZodNumber;
    }, z.core.$strip>>;
    flatrates: z.ZodArray<z.ZodObject<{
        flatRateId: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    discounts: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        amount_cents: z.ZodNumber;
    }, z.core.$strip>>;
    expectedVersion: z.ZodNumber;
}, z.core.$strip>;
export type UpdateOfferInput = z.infer<typeof updateOfferSchema>;
export declare const offerSchema: z.ZodObject<{
    id: z.ZodString;
    customerId: z.ZodString;
    contactPersonId: z.ZodString;
    userId: z.ZodString;
    supplierId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    quoteId: z.ZodString;
    paymentTerm: z.ZodString;
    validUntil: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    requestFrom: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    language: z.ZodEnum<{
        DE: "DE";
        EN: "EN";
    }>;
    featureComparison: z.ZodBoolean;
    toCompare: z.ZodArray<z.ZodString>;
    offerPositions: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        contractId: z.ZodString;
        free_months: z.ZodNumber;
        optional: z.ZodBoolean;
        quantity: z.ZodNumber;
        total_cents: z.ZodNumber;
        duration_months: z.ZodNumber;
        discount_cents: z.ZodNumber;
        eur_user_month: z.ZodNumber;
        id: z.ZodString;
        offerId: z.ZodString;
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
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>>;
    offerFlatRates: z.ZodArray<z.ZodObject<{
        flatRateId: z.ZodString;
        quantity: z.ZodNumber;
        id: z.ZodString;
        offerId: z.ZodString;
        total_cents: z.ZodNumber;
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
    }, z.core.$strip>>;
    offerDiscounts: z.ZodArray<z.ZodLazy<z.ZodObject<{
        id: z.ZodString;
        offerId: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        amount_cents: z.ZodNumber;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>>>;
    offerDocuments: z.ZodArray<z.ZodObject<{
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
        offerId: z.ZodString;
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
        taskId: z.ZodString;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>>;
    user: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        salutation: z.ZodString;
        email: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>;
    customer: z.ZodObject<{
        customerId: z.ZodOptional<z.ZodString>;
        companyName: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        invoiceEmail: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        street: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        zip: z.ZodOptional<z.ZodString>;
        language: z.ZodString;
        country: z.ZodString;
        currency: z.ZodString;
        taxRate: z.ZodNumber;
        salutation: z.ZodOptional<z.ZodString>;
        id: z.ZodString;
        contactPersons: z.ZodArray<z.ZodObject<{
            customerId: z.ZodString;
            salutation: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
            id: z.ZodString;
            createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        }, z.core.$strip>>;
        orders: z.ZodArray<z.ZodObject<{
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
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>;
    customerContactPerson: z.ZodObject<{
        customerId: z.ZodString;
        salutation: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        id: z.ZodString;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>;
    net_amount: z.ZodNumber;
    version: z.ZodNumber;
    date: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>;
export type Offer = z.infer<typeof offerSchema>;
export declare const offerListSchema: z.ZodArray<z.ZodObject<{
    id: z.ZodString;
    customerId: z.ZodString;
    contactPersonId: z.ZodString;
    userId: z.ZodString;
    supplierId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    quoteId: z.ZodString;
    paymentTerm: z.ZodString;
    validUntil: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    requestFrom: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    language: z.ZodEnum<{
        DE: "DE";
        EN: "EN";
    }>;
    featureComparison: z.ZodBoolean;
    toCompare: z.ZodArray<z.ZodString>;
    offerPositions: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        contractId: z.ZodString;
        free_months: z.ZodNumber;
        optional: z.ZodBoolean;
        quantity: z.ZodNumber;
        total_cents: z.ZodNumber;
        duration_months: z.ZodNumber;
        discount_cents: z.ZodNumber;
        eur_user_month: z.ZodNumber;
        id: z.ZodString;
        offerId: z.ZodString;
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
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>>;
    offerFlatRates: z.ZodArray<z.ZodObject<{
        flatRateId: z.ZodString;
        quantity: z.ZodNumber;
        id: z.ZodString;
        offerId: z.ZodString;
        total_cents: z.ZodNumber;
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
    }, z.core.$strip>>;
    offerDiscounts: z.ZodArray<z.ZodLazy<z.ZodObject<{
        id: z.ZodString;
        offerId: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        amount_cents: z.ZodNumber;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>>>;
    offerDocuments: z.ZodArray<z.ZodObject<{
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
        offerId: z.ZodString;
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
        taskId: z.ZodString;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>>;
    user: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        salutation: z.ZodString;
        email: z.ZodString;
        phone: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>;
    customer: z.ZodObject<{
        customerId: z.ZodOptional<z.ZodString>;
        companyName: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        invoiceEmail: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        street: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        zip: z.ZodOptional<z.ZodString>;
        language: z.ZodString;
        country: z.ZodString;
        currency: z.ZodString;
        taxRate: z.ZodNumber;
        salutation: z.ZodOptional<z.ZodString>;
        id: z.ZodString;
        contactPersons: z.ZodArray<z.ZodObject<{
            customerId: z.ZodString;
            salutation: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
            id: z.ZodString;
            createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        }, z.core.$strip>>;
        orders: z.ZodArray<z.ZodObject<{
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
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>;
    customerContactPerson: z.ZodObject<{
        customerId: z.ZodString;
        salutation: z.ZodString;
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        id: z.ZodString;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>;
    net_amount: z.ZodNumber;
    version: z.ZodNumber;
    date: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>>;
export type OfferList = z.infer<typeof offerListSchema>;
export declare const offerDiscountSchema: z.ZodObject<{
    id: z.ZodString;
    offerId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    amount_cents: z.ZodNumber;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>;
export type OfferDiscount = z.infer<typeof offerDiscountSchema>;
export declare const restoreOfferRevisionSchema: z.ZodObject<{
    expectedVersion: z.ZodNumber;
}, z.core.$strip>;
export declare const offerFilterSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    companyIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    contactPersonIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    productIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    sort: z.ZodOptional<z.ZodString>;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type OfferFilterParams = z.input<typeof offerFilterSchema>;
export declare const offersPageSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        customerId: z.ZodString;
        contactPersonId: z.ZodString;
        userId: z.ZodString;
        supplierId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        quoteId: z.ZodString;
        paymentTerm: z.ZodString;
        validUntil: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        requestFrom: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        language: z.ZodEnum<{
            DE: "DE";
            EN: "EN";
        }>;
        featureComparison: z.ZodBoolean;
        toCompare: z.ZodArray<z.ZodString>;
        offerPositions: z.ZodArray<z.ZodObject<{
            productId: z.ZodString;
            contractId: z.ZodString;
            free_months: z.ZodNumber;
            optional: z.ZodBoolean;
            quantity: z.ZodNumber;
            total_cents: z.ZodNumber;
            duration_months: z.ZodNumber;
            discount_cents: z.ZodNumber;
            eur_user_month: z.ZodNumber;
            id: z.ZodString;
            offerId: z.ZodString;
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
            createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        }, z.core.$strip>>;
        offerFlatRates: z.ZodArray<z.ZodObject<{
            flatRateId: z.ZodString;
            quantity: z.ZodNumber;
            id: z.ZodString;
            offerId: z.ZodString;
            total_cents: z.ZodNumber;
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
        }, z.core.$strip>>;
        offerDiscounts: z.ZodArray<z.ZodLazy<z.ZodObject<{
            id: z.ZodString;
            offerId: z.ZodString;
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            amount_cents: z.ZodNumber;
            createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        }, z.core.$strip>>>;
        offerDocuments: z.ZodArray<z.ZodObject<{
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
            offerId: z.ZodString;
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
            taskId: z.ZodString;
            createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        }, z.core.$strip>>;
        user: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            salutation: z.ZodString;
            email: z.ZodString;
            phone: z.ZodNullable<z.ZodString>;
            createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        }, z.core.$strip>;
        customer: z.ZodObject<{
            customerId: z.ZodOptional<z.ZodString>;
            companyName: z.ZodString;
            email: z.ZodOptional<z.ZodString>;
            invoiceEmail: z.ZodOptional<z.ZodString>;
            phone: z.ZodOptional<z.ZodString>;
            street: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
            zip: z.ZodOptional<z.ZodString>;
            language: z.ZodString;
            country: z.ZodString;
            currency: z.ZodString;
            taxRate: z.ZodNumber;
            salutation: z.ZodOptional<z.ZodString>;
            id: z.ZodString;
            contactPersons: z.ZodArray<z.ZodObject<{
                customerId: z.ZodString;
                salutation: z.ZodString;
                firstName: z.ZodString;
                lastName: z.ZodString;
                email: z.ZodString;
                id: z.ZodString;
                createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
                updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            }, z.core.$strip>>;
            orders: z.ZodArray<z.ZodObject<{
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
            createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        }, z.core.$strip>;
        customerContactPerson: z.ZodObject<{
            customerId: z.ZodString;
            salutation: z.ZodString;
            firstName: z.ZodString;
            lastName: z.ZodString;
            email: z.ZodString;
            id: z.ZodString;
            createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
            updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        }, z.core.$strip>;
        net_amount: z.ZodNumber;
        version: z.ZodNumber;
        date: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
        updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    }, z.core.$strip>>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type OffersPage = z.infer<typeof offersPageSchema>;
//# sourceMappingURL=offer.schema.d.ts.map