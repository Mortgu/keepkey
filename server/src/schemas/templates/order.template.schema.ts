import { z } from "zod";

// Required document data, including the tags used by both bundled order templates.
// Other presentation fields remain available to custom templates.
const person = z
    .object({
        firstName: z.string(),
        lastName: z.string(),
        salutation: z.string(),
        fullName: z.string(),
        phone: z.string(),
        email: z.string(),
    })
    .passthrough();
const price = z.object({ total: z.string() }).passthrough();
const group = z
    .object({
        total: z.string(),
        items: z.array(
            z
                .object({
                    name: z.string(),
                    quantity: z.number(),
                    price,
                })
                .passthrough(),
        ),
    })
    .passthrough();
export const orderTemplateSchema = z
    .object({
        orderId: z.string().min(1),
        offerId: z.string().min(1),
        projectId: z.string(),
        projectDescription: z.string(),
        orderDetails: z.string(),
        date: z.string(),
        paymentTerm: z.string(),
        customer: person.extend({
            companyName: z.string(),
            street: z.string(),
            zip: z.string(),
            city: z.string(),
        }),
        employee: person,
        products: z.array(z.object({ name: z.string() }).passthrough()),
        groups: z.array(group),
        tables: z.array(group),
        flatrates: z.array(z.object({ price }).passthrough()),
        total: z.string(),
        discounts: z.array(
            z.object({ title: z.string(), total: z.string() }).passthrough(),
        ),
    })
    .passthrough();
