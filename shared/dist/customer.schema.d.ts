import { z } from 'zod';
export declare const createCustomerSchema: z.ZodObject<{
    customerId: z.ZodOptional<z.ZodString>;
    companyName: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    invoiceEmail: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    street: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    zip: z.ZodOptional<z.ZodString>;
    language: z.ZodEnum<{
        DE: "DE";
        EN: "EN";
    }>;
    country: z.ZodString;
    currency: z.ZodEnum<{
        EUR: "EUR";
        RAND: "RAND";
        DOLLAR: "DOLLAR";
        CHF: "CHF";
    }>;
    taxRate: z.ZodNumber;
    salutation: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export declare const updateCustomerSchema: z.ZodObject<{
    customerId: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    companyName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    invoiceEmail: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    street: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    zip: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    language: z.ZodOptional<z.ZodEnum<{
        DE: "DE";
        EN: "EN";
    }>>;
    country: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodEnum<{
        EUR: "EUR";
        RAND: "RAND";
        DOLLAR: "DOLLAR";
        CHF: "CHF";
    }>>;
    taxRate: z.ZodOptional<z.ZodNumber>;
    salutation: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export declare const customerFormSchema: z.ZodObject<{
    language: z.ZodEnum<{
        DE: "DE";
        EN: "EN";
    }>;
    country: z.ZodString;
    currency: z.ZodEnum<{
        EUR: "EUR";
        RAND: "RAND";
        DOLLAR: "DOLLAR";
        CHF: "CHF";
    }>;
    taxRate: z.ZodNumber;
    salutation: z.ZodOptional<z.ZodString>;
    customerId: z.ZodUnion<readonly [z.ZodString, z.ZodUndefined]>;
    companyName: z.ZodString;
    email: z.ZodEmail;
    invoiceEmail: z.ZodUnion<readonly [z.ZodEmail, z.ZodUndefined]>;
    street: z.ZodString;
    city: z.ZodString;
    zip: z.ZodString;
    phone: z.ZodString;
}, z.core.$strip>;
export type CustomerFormInput = z.infer<typeof customerFormSchema>;
export declare const customerSchema: z.ZodObject<{
    customerId: z.ZodOptional<z.ZodString>;
    companyName: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    invoiceEmail: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    street: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    zip: z.ZodOptional<z.ZodString>;
    language: z.ZodEnum<{
        DE: "DE";
        EN: "EN";
    }>;
    country: z.ZodString;
    currency: z.ZodEnum<{
        EUR: "EUR";
        RAND: "RAND";
        DOLLAR: "DOLLAR";
        CHF: "CHF";
    }>;
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
export type Customer = z.infer<typeof customerSchema>;
export declare const customerListSchema: z.ZodArray<z.ZodObject<{
    customerId: z.ZodOptional<z.ZodString>;
    companyName: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    invoiceEmail: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    street: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    zip: z.ZodOptional<z.ZodString>;
    language: z.ZodEnum<{
        DE: "DE";
        EN: "EN";
    }>;
    country: z.ZodString;
    currency: z.ZodEnum<{
        EUR: "EUR";
        RAND: "RAND";
        DOLLAR: "DOLLAR";
        CHF: "CHF";
    }>;
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
}, z.core.$strip>>;
export type CustomerList = z.infer<typeof customerListSchema>;
export declare const customerFiltersSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CustomerFilters = z.infer<typeof customerFiltersSchema>;
//# sourceMappingURL=customer.schema.d.ts.map