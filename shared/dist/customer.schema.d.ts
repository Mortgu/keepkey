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
    _count: z.ZodObject<{
        offers: z.ZodInt;
        orders: z.ZodInt;
    }, z.core.$strip>;
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
    _count: z.ZodObject<{
        offers: z.ZodInt;
        orders: z.ZodInt;
    }, z.core.$strip>;
    createdAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
    updatedAt: z.ZodPipe<z.ZodUnion<readonly [z.ZodDate, z.ZodISODateTime]>, z.ZodTransform<string, string | Date>>;
}, z.core.$strip>>;
export type CustomerList = z.infer<typeof customerListSchema>;
export declare const customerFiltersSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    sort: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CustomerFilterParams = z.infer<typeof customerFiltersSchema>;
//# sourceMappingURL=customer.schema.d.ts.map