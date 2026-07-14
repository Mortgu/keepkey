import z from "zod";
import { prisma } from "../lib/prismaClient.js";
import { auth } from "../lib/auth.js";
import { AppException } from "../lib/exceptions.js";
import {
    createUserSchema,
    updateUserSchema,
    createContactPersonsSchema,
} from "../schemas/user-schemas.js";

/* ========== Types ========== */

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateContactPersonsInput = z.infer<typeof createContactPersonsSchema>;

/* ========== Queries ========== */

export async function getAllUsers() {
    return prisma.user.findMany({
        include: {
            orders: true,
            customer: true,
            offers: true,
        },
    });
}

export async function getUserById(id: string) {
    return prisma.user.findUnique({
        where: { id },
        include: {
            orders: true,
            customer: {
                include: {
                    contactPersons: true,
                },
            },
        },
    });
}

export async function getSessionUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppException("No session found!", 404, "NO_SESSION");
    }

    return user;
}

/* ========== Mutations ========== */

export async function createUser(input: CreateUserInput & { password: string; salutation: string }) {
    const { email, password, firstName, lastName, salutation, phone, name, role } = input;

    try {
        const createdUser = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: name ?? `${firstName} ${lastName}`,
                firstName,
                lastName,
                salutation,
                phone: phone || undefined,
            },
        });

        if (role) {
            await prisma.user.update({
                where: { id: createdUser.user.id },
                data: { role },
            });
        }

        return createdUser;
    } catch (exception: any) {
        throw new AppException(
            "Something went wrong trying to create user: " + exception.message,
            500,
            "USER_CREATION_FAILED",
        );
    }
}

export async function updateUser(id: string, input: UpdateUserInput) {
    if (!id) {
        throw new AppException("Missing user id!", 400, "MISSING_ID");
    }

    const {
        name,
        salutation,
        firstName,
        lastName,
        phone,
        email,
        role,
        banned,
        banReason,
        banExpires,
        image,
    } = input;

    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                name,
                salutation,
                firstName,
                lastName,
                phone,
                email,
                role,
                banned,
                banReason,
                banExpires,
                image,
            },
        });

        return user;
    } catch (exception: any) {
        throw new AppException(
            "Something went wrong trying to update user: " + exception.message,
            500,
            "USER_UPDATE_FAILED",
        );
    }
}

export async function createContactPersons(userId: string, persons: CreateContactPersonsInput) {
    return prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findUnique({
            where: { id: userId },
        });

        if (!customer) {
            throw new AppException("No customer linked to this account!", 400, "NO_CUSTOMER_LINKED");
        }

        const created = await tx.contactPerson.createMany({
            data: persons.map((p) => ({ ...p, customerId: customer.id })),
        });

        return created;
    });
}

/* ========== Deletes ========== */

export async function deleteUser(id: string): Promise<void> {
    if (!id) {
        throw new AppException("Missing user id!", 400, "MISSING_ID");
    }

    try {
        await prisma.user.delete({
            where: { id },
        });
    } catch (exception: any) {
        throw new AppException(
            "Something went wrong trying to delete user: " + exception.message,
            500,
            "USER_DELETE_FAILED",
        );
    }
}

export async function deleteAccount(userId: string): Promise<void> {
    await prisma.user.delete({
        where: { id: userId },
    });
}
