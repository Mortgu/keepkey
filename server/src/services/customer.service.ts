import z from "zod";
import { prisma } from "../lib/prismaClient.js";
import type { Customer, ContactPerson } from "@prisma/client";
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

export async function getCustomers() {
    return prisma.customer.findMany({
        include: {
            contactPersons: true,
            orders: true,
            offers: true,
        },
    });
}

export async function getCustomerById(id: string): Promise<Customer> {
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

export async function getCustomerContacts(customerId: string): Promise<ContactPerson[]> {
    return prisma.contactPerson.findMany({
        where: { customerId },
    });
}

/* ========== Mutations ========== */

export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const { contactPersons, ...customerFields } = input;

    return prisma.$transaction(async (tx) => {
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

export async function createCustomerContact(customerId: string, input: CreateCustomerContactInput): Promise<ContactPerson> {
    return prisma.contactPerson.create({
        data: { ...input, customerId }
    });
}

export async function updateCustomerContact(contactId: string, input: UpdateCustomerContactInput): Promise<ContactPerson> {
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
