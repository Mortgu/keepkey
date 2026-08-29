import { Prisma, prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import { recordActivity } from "./activity.service.js";
import {
    CreateCustomerInput,
    UpdateCustomerInput,

    CreateContactInput,
    UpdateContactInput,
    CustomerFilterParams,
} from "@keepit/schemas";


/* ========== Queries ========== */

export async function getCustomers(filters: CustomerFilterParams) {
    const { search, sort } = filters;

    const where: Prisma.CustomerWhereInput = {};

    if (search) {
        const s = search.trim();
        where.OR = [
            { companyName: { contains: s, mode: "insensitive" } },
            { customerId: { contains: s, mode: "insensitive" } },
            { email: { contains: s, mode: "insensitive" } },
            { phone: { contains: s, mode: "insensitive" } },
            { contactPersons: { some: { firstName: { contains: s, mode: "insensitive" } } } },
            { contactPersons: { some: { lastName: { contains: s, mode: "insensitive" } } } },
        ];
    }

    let orderBy: Prisma.CustomerOrderByWithRelationInput = { createdAt: "desc" };
    if (sort) {
        const [field, direction] = sort.split(":") as [string, Prisma.SortOrder | undefined];
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
            _count: {
                select: {
                    offers: true,
                    orders: true,
                }
            }
        },
    });
}

export async function getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
            contactPersons: true,
            _count: {
                select: {
                    offers: true,
                    orders: true,
                }
            }
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
    return prisma.$transaction(async (tx) => {
        const customer = await tx.customer.create({
            data: input,
        });

        await recordActivity(tx, {
            type: "customer.created",
            entity: "CUSTOMER",
            entityId: customer.id,
            customerId: customer.id,
            payload: { companyName: customer.companyName },
        });

        return customer;
    });
}

export async function updateCustomer(id: string, input: UpdateCustomerInput): Promise<void> {
    await prisma.$transaction(async (tx) => {
        const customer = await tx.customer.update({
            where: { id },
            data: input,
        });

        await recordActivity(tx, {
            type: "customer.updated",
            entity: "CUSTOMER",
            entityId: id,
            customerId: id,
            payload: { companyName: customer.companyName },
        });
    });
}

export async function createCustomerContact(customerId: string, input: CreateContactInput) {
    return prisma.contactPerson.create({
        data: { ...input, customerId }
    });
}

export async function updateCustomerContact(contactId: string, input: UpdateContactInput) {
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
    await prisma.$transaction(async (tx) => {
        const customer = await tx.customer.delete({
            where: { id },
        });

        await recordActivity(tx, {
            type: "customer.deleted",
            entity: "CUSTOMER",
            entityId: id,
            payload: { companyName: customer.companyName },
        });
    });
}

export async function deleteCustomerContact(contactId: string): Promise<void> {
    await prisma.contactPerson.delete({
        where: { id: contactId },
    });
}
