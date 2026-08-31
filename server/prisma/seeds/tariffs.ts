import type { PrismaClient, Product, Contract, ContractTranslation, Customer } from "@prisma/client";

type ContractWithTranslations = Contract & { translations: ContractTranslation[] };

interface SeedTariffParams {
    products: Product[];
    contracts: ContractWithTranslations[];
    customers: Customer[];
}

/** Die Achsen des Preisrasters. Sie gelten global, nicht je Tarif. */
const STANDARD_DURATIONS = [12, 24];
const STANDARD_TIERS = [
    { min_quantity: 1, max_quantity: 10 },
    { min_quantity: 11, max_quantity: null },
];

export async function seedTariffs(prisma: PrismaClient, { products, contracts, customers }: SeedTariffParams) {
    const productIds = products.map(p => p.id);
    if (productIds.length < 2) {
        console.log("Not enough products to seed a TariffGroup, skipping.");
        return;
    }

    // 1. Die beiden Achsen zuerst und genau einmal — sie hängen an keinem Tarif.
    //    Vorher lief das je Vertrag mit und war nur zufällig idempotent.
    for (const months of STANDARD_DURATIONS) {
        await prisma.standardDuration.upsert({
            where: { months },
            create: { months },
            update: {},
        });
    }

    // Staffeln gelten global, seit die Zeilenachse nicht mehr an der Gruppe
    // hängt. Ein Upsert auf `min_quantity` allein legte deshalb in einer
    // gepflegten Datenbank Staffeln an, die sich mit den vorhandenen
    // überschneiden — ein Zustand, den `createStandardTier` über
    // `assertNoOverlap` nie zuließe. Wer schon eine Staffelung hat, behält sie.
    const existingTiers = await prisma.standardTier.findMany();

    for (const tier of STANDARD_TIERS) {
        const tierMax = tier.max_quantity ?? Number.POSITIVE_INFINITY;
        const overlapping = existingTiers.find((existing) => {
            const existingMax = existing.max_quantity ?? Number.POSITIVE_INFINITY;
            return tier.min_quantity <= existingMax && existing.min_quantity <= tierMax;
        });

        if (overlapping) {
            console.log(
                `Standard tier ${tier.min_quantity}-${tier.max_quantity ?? "∞"} overlaps `
                + `${overlapping.min_quantity}-${overlapping.max_quantity ?? "∞"}, skipping.`,
            );
            continue;
        }

        await prisma.standardTier.create({ data: tier });
    }

    // 2. TariffGroup anlegen (falls noch nicht vorhanden)
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

    // 3. Pro Contract einen Tariff anlegen (falls noch nicht vorhanden)
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

        // 4. Zellen — eine Zelle ist ihre Koordinate plus Preis. Die Koordinaten
        //    müssen auf den Achsen oben liegen, sonst ist der Preis nicht
        //    erreichbar.
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

            // 5. Kunden-spezifischer Override für den ersten Kunden.
            //    `create`, kein Upsert: der zusammengesetzte Unique-Key enthält
            //    das nullbare `productId` und ist als Where-Eingabe deshalb
            //    nicht ausdrückbar. Nötig ist er hier auch nicht — der Zweig
            //    läuft nur für einen frisch angelegten Tarif.
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

        console.log(`Tariff created for contract "${contract.translations[0]?.name}" with ${cells.length} cells.`);
    }
}
