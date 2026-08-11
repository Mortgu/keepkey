import { Prisma } from "@prisma/client";
import { prisma } from "./src/lib/prismaClient.js";

async function main() {
    const existing = await prisma.offer.findFirst();
    if (!existing) { console.log("kein Angebot vorhanden"); return; }

    try {
        await prisma.offer.create({ data: { ...existing, id: undefined } as any });
    } catch (e: any) {
        console.log("instanceof KnownRequestError:", e instanceof Prisma.PrismaClientKnownRequestError);
        console.log("constructor:", e?.constructor?.name);
        console.log("code:", e?.code);
        console.log("meta:", JSON.stringify(e?.meta));
    }
    await prisma.$disconnect();
}
main();
