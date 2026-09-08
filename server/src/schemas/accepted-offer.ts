import {
    offerTemplateSchema,
    type OfferTemplate,
} from "./templates/offer.template.schema.js";
import { z } from "zod";
import { AppException } from "../lib/exceptions.js";

const date = z.coerce.date();
const text = z.string().nullable();
const language = z.enum(["DE", "EN"]);
const timestamps = { createdAt: date, updatedAt: date };
const translation = z.object({
    language,
    name: z.string(),
    description: text.optional(),
    table: text.optional(),
});
const product = z.object({
    id: z.string(),
    translations: z.array(translation),
    ...timestamps,
});
const flatRate = z.object({
    id: z.string(),
    total_cents: z.number().int(),
    translations: z.array(translation),
    ...timestamps,
});
export const commercialSourceSchema = z.object({
    supplierId: text,
    customerId: z.string(),
    contactPersonId: z.string(),
    employeeId: z.string(),
    contractId: z.string(),
    duration_months: z.number().int(),
    paymentTerm: z.string(),
    language,
    validUntil: date.nullable(),
    requestFrom: date.nullable(),
    net_amount: z.number().int(),
    customer: z.object({
        id: z.string(),
        customerId: text,
        companyName: z.string(),
        language,
        email: text,
        invoiceEmail: text,
        phone: text,
        street: text,
        city: text,
        zip: text,
        country: z.string(),
        currency: z.enum(["EUR", "RAND", "DOLLAR", "CHF"]),
        taxRate: z.number(),
        salutation: text,
        ...timestamps,
    }),
    customerContactPerson: z.object({
        id: z.string(),
        customerId: z.string(),
        salutation: text,
        firstName: z.string(),
        lastName: z.string(),
        email: text,
        ...timestamps,
    }),
    employee: z.object({
        id: z.string(),
        name: z.string(),
        salutation: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string(),
        phone: text,
        ...timestamps,
    }),
    contract: z.object({
        id: z.string(),
        translations: z.array(
            z.object({
                language,
                name: z.string(),
                features: z.array(z.string()),
                table: z.string(),
            }),
        ),
        ...timestamps,
    }),
    positions: z.array(
        z.object({
            id: z.string(),
            productId: z.string(),
            product,
            quantity: z.number().int(),
            optional: z
                .boolean()
                .nullish()
                .transform((v) => v ?? false),
            total_cents: z.number().int(),
            discount_cents: z.number().int().default(0),
            free_months: z.number().int().default(0),
            eur_user_month: z.number().int().default(0),
            tariffVersionId: text.optional(),
            createdAt: date,
            updatedAt: date,
        }),
    ),
    flatRates: z.array(
        z.object({
            id: z.string(),
            flatRateId: z.string(),
            flatRate,
            quantity: z.number().int(),
            total_cents: z.number().int(),
        }),
    ),
    discounts: z.array(
        z.object({
            id: z.string(),
            title: z.string(),
            description: text,
            amount_cents: z.number().int(),
            ...timestamps,
        }),
    ),
});
export const acceptedOfferSnapshotSchema = z.object({
    schemaVersion: z.literal(1),
    source: commercialSourceSchema,
    offerTemplate: offerTemplateSchema,
});
export type CommercialSource = z.infer<typeof commercialSourceSchema>;

export function parseAcceptedOfferSnapshot(value: unknown): CommercialSource {
    const result = acceptedOfferSnapshotSchema.safeParse(value);
    if (!result.success) {
        throw new AppException(
            "The accepted offer snapshot is invalid or unsupported.",
            422,
            "INVALID_ACCEPTED_OFFER_SNAPSHOT",
        );
    }
    return result.data.source;
}

/** Explicit JSON boundary: dates become ISO strings; schema strips private user fields. */
export function serializeAcceptedOfferSnapshot(
    source: unknown,
    offerTemplate: OfferTemplate,
) {
    return JSON.parse(
        JSON.stringify(
            acceptedOfferSnapshotSchema.parse({
                schemaVersion: 1,
                source,
                offerTemplate,
            }),
        ),
    ) as import("@prisma/client").Prisma.JsonObject;
}

export function parseAcceptedOfferTemplate(value: unknown): OfferTemplate {
    const result = acceptedOfferSnapshotSchema.safeParse(value);
    if (!result.success)
        throw new AppException(
            "Invalid accepted offer snapshot",
            422,
            "INVALID_ACCEPTED_OFFER_SNAPSHOT",
        );
    return result.data.offerTemplate;
}
