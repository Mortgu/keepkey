import type { PrismaClient } from "@prisma/client";
import { auth } from "../../src/lib/auth.js";

const OWNER = {
    email: "admin@dignum.de",
    password: "admin1234",
    name: "Admin User",
    firstName: "Admin",
    lastName: "User",
    salutation: "Herr",
};

export async function seedOwner(prisma: PrismaClient) {
    const existing = await prisma.user.findUnique({
        where: { email: OWNER.email },
    });

    if (existing) {
        console.log(`User ${OWNER.email} already exists, skipping.`);
        return;
    }

    await auth.api.signUpEmail({
        body: {
            email: OWNER.email,
            password: OWNER.password,
            name: OWNER.name,
            firstName: OWNER.firstName,
            lastName: OWNER.lastName,
            salutation: OWNER.salutation,
        },
    });

    await prisma.user.update({
        where: { email: OWNER.email },
        data: { role: "admin" },
    });

    console.log(`Created owner user: ${OWNER.email}`);
}
