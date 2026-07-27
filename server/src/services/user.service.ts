import { z } from "zod";
import { prisma } from "../lib/prismaClient.js";
import { auth } from "../lib/auth.js";
import { AppException } from "../lib/exceptions.js";
import {
    type CreateContactInput,
    type CreateUserInput,
    type UpdateUserInput,
    userSchema,
    userListSchema,
} from "@keepit/schemas";

type User = z.input<typeof userSchema>;
type UserList = z.input<typeof userListSchema>;

/* ========== Queries ========== */

export async function getAllUsers(): Promise<UserList> {
    return prisma.user.findMany({
        include: {
            orders: true,
            customer: true,
            offers: true,
        },
    });
}

export async function getUserById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
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

    if (!user) {
        throw new AppException("User not found!", 404, "USER_NOT_FOUND");
    }

    return user;
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

export async function createUser(input: CreateUserInput) {
    const { email, password, firstName, lastName, salutation, phone } = input;

    try {
        const createdUser = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name: `${firstName} ${lastName}`,
                firstName,
                lastName,
                salutation,
                phone: phone || undefined,
            },
        });

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
        salutation,
        firstName,
        lastName,
        phone,
        email,
    } = input;

    try {
        const user = await prisma.user.update({
            where: { id },
            data: {
                name: `${firstName} ${lastName}`,
                salutation,
                firstName,
                lastName,
                phone,
                email,
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

export async function createContactPersons(userId: string, persons: Array<CreateContactInput>) {
    return prisma.$transaction(async (tx) => {
        const customer = await tx.customer.findUnique({
            where: { id: userId },
        });

        if (!customer) {
            throw new AppException("No customer linked to this account!", 400, "NO_CUSTOMER_LINKED");
        }

        const created = await tx.contactPerson.createMany({
            data: persons.map(person => ({
                ...person,
                customerId: customer.id
            })),
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
