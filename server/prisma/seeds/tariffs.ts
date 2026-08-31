import type { PrismaClient, Product, Contract, ContractTranslation, Customer } from "@prisma/client";

type ContractWithTranslations = Contract & { translations: ContractTranslation[] };

interface SeedTariffParams {
    products: Product[];
    contracts: ContractWithTranslations[];
    customers: Customer[];
}

export async function seedTariffs(prisma: PrismaClient, { products, contracts, customers }: SeedTariffParams) {
    const productIds = products.map(p => p.id);
    if (productIds.length < 2) {
        console.log("Not enough products to seed a TariffGroup, skipping.");
        return;
    }

    // 1. TariffGroup anlegen (falls noch nicht vorhanden)
    let tariffGroup = await prisma.tariffGroup.findFirst({
        where: { products: { some: { productId: productIds[0] } } },
        include: { products: true },
    });

    if (!tariffGroup) {
        tariffGroup = await prisma.tariffGroup.create({
            data: {
                products: {
                    create: productIds.slice(0, 2).map(productId => ({ productId })),
                },
            },
            include: { products: true },
        });
        console.log(`TariffGroup created with ${tariffGroup.products.length} product(s).`);
    } else {
        console.log("TariffGroup already exists, skipping.");
    }

    const tariffGroupId = tariffGroup.id;

    // 2. Pro Contract einen Tariff anlegen (falls noch nicht vorhanden)
    for (const contract of contracts) {
        const existingTariff = await prisma.tariff.findUnique({
            where: { tariffGroupId_contractId: { tariffGroupId, contractId: contract.id } },
        });

        if (existingTariff) {
            console.log(`Tariff for contract "${contract.translations[0]?.name}" exists, skipping.`);
            continue;
        }

        const tariff = await prisma.tariff.create({
            data: {
                tariffGroupId,
                contractId: contract.id,
            },
        });

        // 3. Standardlaufzeiten — die Spaltenachse ist global, nicht am Tarif.
        for (const months of [12, 24]) {
            await prisma.standardDuration.upsert({
                where: { months },
                create: { months },
                update: {},
            });
        }

        // 4. Mengenstaffeln an der Gruppe (idempotent — alle Tarife teilen sie)
        for (const tier of [{ min_quantity: 1, max_quantity: 10 }, { min_quantity: 11, max_quantity: null }]) {
            await prisma.tariffTier.upsert({
                where: { tariffGroupId_min_quantity: { tariffGroupId, min_quantity: tier.min_quantity } },
                create: { tariffGroupId, ...tier },
                update: {},
            });
        }

        // 5. Zellen — eine Zelle ist ihre Koordinate plus Preis.
        const cells = [
            { duration: 12, min_quantity: 1, price: 10 },
            { duration: 24, min_quantity: 1, price: 9 },
            { duration: 12, min_quantity: 11, price: 5 },
            { duration: 24, min_quantity: 11, price: 4 },
        ];

        for (const cellData of cells) {
            await prisma.tariffCell.create({
                data: {
                    tariffId: tariff.id,
                    duration: cellData.duration,
                    min_quantity: cellData.min_quantity,
                    price: cellData.price,
                },
            });

            // 6. Kunden-spezifischer Override für den ersten Kunden
            const firstCustomer = customers[0];
            if (firstCustomer) {
                await prisma.tariffCustomerPrice.create({
                    data: {
                        tariffId: tariff.id,
                        customerId: firstCustomer.id,
                        productId: null,
                        duration: cellData.duration,
                        min_quantity: cellData.min_quantity,
                        price: Math.max(1, Math.floor(cellData.price * 0.8)),
                    },
                });
            }
        }

        console.log(`Tariff created for contract "${contract.translations[0]?.name}" with 2 columns, 2 rows and cells.`);
    }
}
