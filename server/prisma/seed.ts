import { prisma } from "../src/lib/prismaClient.js";
import { seedOwner } from "./seeds/owner.js";
import { seedSuppliers } from "./seeds/suppliers.js";
import { seedContracts } from "./seeds/contracts.js";
import { seedProducts } from "./seeds/products.js";
import { seedCustomers } from "./seeds/customers.js";
import { seedFlatRates } from "./seeds/flat-rates.js";
import { seedTariffs } from "./seeds/tariffs.js";

async function main() {
    await seedOwner(prisma);

    await seedSuppliers(prisma);
    const contracts = await seedContracts(prisma);
    const products = await seedProducts(prisma);
    const customers = await seedCustomers(prisma);
    await seedFlatRates(prisma);
    await seedTariffs(prisma, { products, contracts, customers });

    console.log("\nSeed finished successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
