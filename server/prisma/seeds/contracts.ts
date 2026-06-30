import type { PrismaClient, Contract, ContractTranslation } from "@prisma/client";

type ContractWithTranslations = Contract & { translations: ContractTranslation[] };

const CONTRACTS = [
    {
        translations: {
            DE: {
                name: "Enterprise Unlimited",
                features: [
                    "Datenaufbewahrung / max. Retention: unlimitiert (>99 Jahre)",
                    "API-Unterstützung für Integration von Drittanbietern",
                    "Individuelles RBAC (individuelle Anpassung von Rollen & Rechten)",
                    "24*7 Support über Telefon, Chat & eMail",
                    "Persönlicher Customer Success Manager",
                ],
                table: "",
            },
            EN: {
                name: "Enterprise Unlimited",
                features: [
                    "Data retention / max. retention: unlimited (>99 years)",
                    "API support for third-party integration",
                    "Custom RBAC (custom roles & permissions)",
                    "24/7 support via phone, chat & email",
                    "Personal Customer Success Manager",
                ],
                table: "",
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Business Essentials",
                features: [
                    "Datenaufbewahrung / max. Retention: 1 Jahr",
                    "9*5 Support (Business Hours) über Chat & eMail",
                ],
                table: "",
            },
            EN: {
                name: "Business Essentials",
                features: [
                    "Data retention / max. retention: 1 year",
                    "9/5 support (business hours) via chat & email",
                ],
                table: "",
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Governance Plus",
                features: [],
                table: "",
            },
            EN: {
                name: "Governance Plus",
                features: [],
                table: "",
            },
        },
    },
];

export async function seedContracts(prisma: PrismaClient): Promise<ContractWithTranslations[]> {
    const results: ContractWithTranslations[] = [];

    for (const data of CONTRACTS) {
        let contract = await prisma.contract.findFirst({
            where: {
                translations: {
                    some: { language: "DE", name: data.translations.DE.name },
                },
            },
            include: { translations: true },
        });

        if (!contract) {
            contract = await prisma.contract.create({
                data: {
                    translations: {
                        create: [
                            { language: "DE", ...data.translations.DE },
                            { language: "EN", ...data.translations.EN },
                        ],
                    },
                },
                include: { translations: true },
            });
            console.log(`Contract created: ${data.translations.DE.name}`);
        } else {
            console.log(`Contract exists: ${data.translations.DE.name}`);
        }
        results.push(contract);
    }

    return results;
}
