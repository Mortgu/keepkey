import z from "zod";
import { Prisma, prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import {
    createCustomerSchema,
    updateCustomerSchema,
    createCustomerContactSchema,
    updateCustomerContactSchema,
} from "../schemas/customer-schemas.js";

/* ========== Types ========== */

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateCustomerContactInput = z.infer<typeof createCustomerContactSchema>;
export type UpdateCustomerContactInput = z.infer<typeof updateCustomerContactSchema>;

/* ========== Queries ========== */

export async function getCustomers(params?: {
    search?: string;
    sort?: string;
}) {
    const where: Prisma.CustomerWhereInput = {};

    if (params?.search) {
        const search = params.search.trim();
        where.OR = [
            { companyName: { contains: search, mode: "insensitive" } },
            { customerId: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { contactPersons: { some: { firstName: { contains: search, mode: "insensitive" } } } },
            { contactPersons: { some: { lastName: { contains: search, mode: "insensitive" } } } },
        ];
    }

    let orderBy: Prisma.CustomerOrderByWithRelationInput = { createdAt: "desc" };
    if (params?.sort) {
        const [field, direction] = params.sort.split(":") as [string, Prisma.SortOrder | undefined];
        const dir = direction ?? "desc";
        if (field === "companyName" || field === "createdAt" || field === "customerId") {
            orderBy = { [field]: dir as Prisma.SortOrder };
        }
    }

    return prisma.customer.findMany({
        where,
        orderBy,
        include: {
            contactPersons: true,
            orders: true,
            offers: true,
        },
    });
}

export async function getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            contactPersons: true,
            orders: true,
            offers: true,
        },
    });

    if (!customer) {
        throw new AppException("Customer not found!", 404, "CUSTOMER_NOT_FOUND");
    }

    return customer;
}

export async function getCustomerContacts(customerId: string) {
    return prisma.contactPerson.findMany({
        where: { customerId },
    });
}

/* ========== Mutations ========== */

export async function createCustomer(input: CreateCustomerInput) {
    const { contactPersons, ...customerFields } = input;

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const customer = await tx.customer.create({
            data: customerFields,
        });

        if (contactPersons && contactPersons.length > 0) {
            await tx.contactPerson.createMany({
                data: contactPersons.map((p) => ({
                    ...p,
                    customerId: customer.id,
                })),
            });
        }

        return customer;
    });
}

export async function updateCustomer(id: string, input: UpdateCustomerInput): Promise<void> {
    const { contactPersons, ...customerFields } = input;

    await prisma.$transaction(async (tx) => {
        await tx.customer.update({
            where: { id },
            data: customerFields,
        });

        if (contactPersons !== undefined) {
            await tx.contactPerson.deleteMany({
                where: { customerId: id }
            });

            if (contactPersons.length > 0) {
                await tx.contactPerson.createMany({
                    data: contactPersons.map((p) => ({
                        salutation: p.salutation,
                        firstName: p.firstName,
                        lastName: p.lastName,
                        email: p.email,
                        customerId: id,
                    })),
                });
            }
        }
    });
}

export async function createCustomerContact(customerId: string, input: CreateCustomerContactInput) {
    return prisma.contactPerson.create({
        data: { ...input, customerId }
    });
}

export async function updateCustomerContact(contactId: string, input: UpdateCustomerContactInput) {
    const contact = await prisma.contactPerson.update({
        where: { id: contactId },
        data: input
    });

    if (!contact) {
        throw new AppException("Contact not found! Invalid id!", 404, "CONTACT_NOT_FOUND");
    }

    return contact;
}

/* ========== Deletes ========== */

export async function deleteCustomer(id: string): Promise<void> {
    await prisma.customer.delete({
        where: { id },
    });
}

export async function deleteCustomerContact(contactId: string): Promise<void> {
    await prisma.contactPerson.delete({
        where: { id: contactId },
    });
}
