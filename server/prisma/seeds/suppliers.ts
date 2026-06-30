import type { PrismaClient, Supplier } from "@prisma/client";

const SUPPLIERS = [
    { supplierId: "SUP-001", name: "Dignum IT-Services GmbH" },
    { supplierId: "SUP-002", name: "CloudHosting AG" },
];

export async function seedSuppliers(prisma: PrismaClient): Promise<Supplier[]> {
    const results: Supplier[] = [];

    for (const data of SUPPLIERS) {
        let supplier = await prisma.supplier.findFirst({
            where: { supplierId: data.supplierId },
        });

        if (!supplier) {
            supplier = await prisma.supplier.create({ data });
            console.log(`Supplier created: ${supplier.name}`);
        } else {
            console.log(`Supplier exists: ${supplier.name}`);
        }
        results.push(supplier);
    }

    return results;
}
