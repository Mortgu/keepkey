import { Prisma, prisma } from "../lib/prismaClient.js";
import { AppException } from "../lib/exceptions.js";
import {
    CreateCustomerInput,
    UpdateCustomerInput,

    CreateContactInput,
    UpdateContactInput,
} from "@keepit/schemas";


/* ========== Queries ========== */

export async function getCustomers(params?: { search?: string; sort?: string; }) {
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
    const customer = await prisma.customer.create({
        data: input,
    });

    return customer;
}

export async function updateCustomer(id: string, input: UpdateCustomerInput): Promise<void> {
    await prisma.customer.update({
        where: { id },
        data: input,
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
    await prisma.customer.delete({
        where: { id },
    });
}

export async function deleteCustomerContact(contactId: string): Promise<void> {
    await prisma.contactPerson.delete({
        where: { id: contactId },
    });
}
