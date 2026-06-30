import type { PrismaClient, FlatRate } from "@prisma/client";

const FLAT_RATE_TABLE = "dignum Dienstleistung - Keepit Backup für {products.names} - Onboarding, Unterstützung bei Ersteinrichtung & Konfiguration sowie Einweisung / Schulung auf das Produkt - Pauschalpreis (einmalig)";

const FLAT_RATES = [
    {
        total_cents: 299_00,
        translations: {
            DE: { name: "Einrichtungsgebühr", table: FLAT_RATE_TABLE },
            EN: { name: "Setup fee", table: FLAT_RATE_TABLE },
        },
    },
    {
        total_cents: 499_00,
        translations: {
            DE: { name: "Migrationsservice", table: FLAT_RATE_TABLE },
            EN: { name: "Migration service", table: FLAT_RATE_TABLE },
        },
    },
];

export async function seedFlatRates(prisma: PrismaClient): Promise<FlatRate[]> {
    const results: FlatRate[] = [];

    for (const data of FLAT_RATES) {
        let flatRate = await prisma.flatRate.findFirst({
            where: {
                translations: {
                    some: { language: "DE", name: data.translations.DE.name },
                },
            },
            include: { translations: true },
        });

        if (!flatRate) {
            flatRate = await prisma.flatRate.create({
                data: {
                    total_cents: data.total_cents,
                    translations: {
                        create: [
                            { language: "DE", ...data.translations.DE },
                            { language: "EN", ...data.translations.EN },
                        ],
                    },
                },
                include: { translations: true },
            });
            console.log(`FlatRate created: ${data.translations.DE.name}`);
        } else {
            console.log(`FlatRate exists: ${data.translations.DE.name}`);
        }
        results.push(flatRate);
    }

    return results;
}
