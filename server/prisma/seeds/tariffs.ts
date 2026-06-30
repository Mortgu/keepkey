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

        // 3. Columns (Laufzeiten): 12 und 24 Monate
        const column12 = await prisma.tariffColumn.create({
            data: { tariffId: tariff.id, duration: 12, order: 0 },
        });
        const column24 = await prisma.tariffColumn.create({
            data: { tariffId: tariff.id, duration: 24, order: 1 },
        });

        // 4. Rows (Mengenbereiche)
        const rowSmall = await prisma.tariffRow.create({
            data: { tariffId: tariff.id, min_quantity: 1, max_quantity: 10, order: 0 },
        });
        const rowLarge = await prisma.tariffRow.create({
            data: { tariffId: tariff.id, min_quantity: 11, max_quantity: null, order: 1 },
        });

        // 5. Cells + Default-Preise
        const cells = [
            { rowId: rowSmall.id, columnId: column12.id, price: 10 },
            { rowId: rowSmall.id, columnId: column24.id, price: 9 },
            { rowId: rowLarge.id, columnId: column12.id, price: 5 },
            { rowId: rowLarge.id, columnId: column24.id, price: 4 },
        ];

        for (const cellData of cells) {
            const cell = await prisma.tariffCell.create({
                data: {
                    tariffId: tariff.id,
                    rowId: cellData.rowId,
                    columnId: cellData.columnId,
                },
            });

            await prisma.tariffCellDefault.create({
                data: { cellId: cell.id, price: cellData.price },
            });

            // 6. Kunden-spezifischer Override für den ersten Kunden
            const firstCustomer = customers[0];
            if (firstCustomer) {
                await prisma.tariffCellCustomer.create({
                    data: {
                        cellId: cell.id,
                        customerId: firstCustomer.id,
                        price: Math.max(1, Math.floor(cellData.price * 0.8)),
                    },
                });
            }
        }

        console.log(`Tariff created for contract "${contract.translations[0]?.name}" with 2 columns, 2 rows and cells.`);
    }
}
