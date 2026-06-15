import {auth} from "../src/lib/auth.js";
import {prisma} from "../src/lib/prismaClient.js";

const OWNER = {
    email: "admin@dignum.de",
    password: "admin1234",
    name: "Admin User",
    firstName: "Admin",
    lastName: "User",
    salutation: "Herr",
};

/* ───────────────────────────────
   Reference / master data
   ─────────────────────────────── */

const SUPPLIERS = [
    {supplierId: "SUP-001", name: "Dignum IT-Services GmbH"},
    {supplierId: "SUP-002", name: "CloudHosting AG"},
];

const CONTRACTS = [
    {
        key: "basic",
        translations: {
            DE: {
                name: "Basic",
                features: ["E-Mail-Support", "8×5 Verfügbarkeit", "Standard-SLA"],
                table: "contract_basic"
            },
            EN: {
                name: "Basic",
                features: ["Email support", "8×5 availability", "Standard SLA"],
                table: "contract_basic"
            },
        },
    },
    {
        key: "professional",
        translations: {
            DE: {
                name: "Professional",
                features: ["Telefon- & E-Mail-Support", "24×7 Verfügbarkeit", "Premium-SLA", "Priorisierte Bearbeitung"],
                table: "contract_pro",
            },
            EN: {
                name: "Professional",
                features: ["Phone & email support", "24×7 availability", "Premium SLA", "Prioritized handling"],
                table: "contract_pro",
            },
        },
    },
    {
        key: "enterprise",
        translations: {
            DE: {
                name: "Enterprise",
                features: ["Dedizierter Account Manager", "24×7 Verfügbarkeit", "Enterprise-SLA", "On-Site Support", "Custom Development"],
                table: "contract_enterprise",
            },
            EN: {
                name: "Enterprise",
                features: ["Dedicated account manager", "24×7 availability", "Enterprise SLA", "On-site support", "Custom development"],
                table: "contract_enterprise",
            },
        },
    },
];

const PRODUCTS = [
    {
        key: "managed-server",
        translations: {
            DE: {
                name: "Managed Server",
                description: "Vollständig verwalteter Server inkl. Backup & Monitoring",
                table: "server"
            },
            EN: {
                name: "Managed Server",
                description: "Fully managed server incl. backup & monitoring",
                table: "server"
            },
        },
    },
    {
        key: "cloud-storage",
        translations: {
            DE: {
                name: "Cloud Storage",
                description: "Skalierbarer Objektspeicher mit S3-kompatibler API",
                table: "storage"
            },
            EN: {
                name: "Cloud Storage",
                description: "Scalable object storage with S3-compatible API",
                table: "storage"
            },
        },
    },
    {
        key: "email-hosting",
        translations: {
            DE: {
                name: "E-Mail Hosting",
                description: "Business-E-Mail mit Exchange- und IMAP-Unterstützung",
                table: "email"
            },
            EN: {name: "Email Hosting", description: "Business email with Exchange and IMAP support", table: "email"},
        },
    },
    {
        key: "webhosting",
        translations: {
            DE: {
                name: "Webhosting",
                description: "Shared-Hosting mit PHP, MySQL und SSL-Zertifikat",
                table: "webhosting"
            },
            EN: {
                name: "Web Hosting",
                description: "Shared hosting with PHP, MySQL and SSL certificate",
                table: "webhosting"
            },
        },
    },
    {
        key: "ddos-protection",
        translations: {
            DE: {name: "DDoS Protection", description: "Edge-Schutz gegen DDoS-Angriffe", table: "security"},
            EN: {name: "DDoS Protection", description: "Edge protection against DDoS attacks", table: "security"},
        },
    },
];

/** Price in cents (Euro) — matrix: product × contract × terms × quantity tiers */
const TARIFF_DATA = [
    {
        productKey: "managed-server",
        contractKey: "basic",
        terms: [12, 24],
        rows: [
            {min_quantity: 1, max_quantity: 5, prices: [4_900, 4_400]},
            {min_quantity: 6, max_quantity: 25, prices: [3_900, 3_500]},
        ],
    },
    {
        productKey: "managed-server",
        contractKey: "professional",
        terms: [12, 24],
        rows: [
            {min_quantity: 1, max_quantity: 10, prices: [9_900, 8_900]},
            {min_quantity: 11, max_quantity: 50, prices: [8_400, 7_600]},
        ],
    },
    {
        productKey: "managed-server",
        contractKey: "enterprise",
        terms: [12, 24],
        rows: [
            {min_quantity: 1, max_quantity: 999_999, prices: [19_900, 17_900]},
        ],
    },
    {
        productKey: "cloud-storage",
        contractKey: "basic",
        terms: [12, 24],
        rows: [
            {min_quantity: 1, max_quantity: 10, prices: [2_900, 2_400]},
            {min_quantity: 11, max_quantity: 100, prices: [2_200, 1_800]},
        ],
    },
    {
        productKey: "cloud-storage",
        contractKey: "professional",
        terms: [12, 24],
        rows: [
            {min_quantity: 1, max_quantity: 10, prices: [5_900, 5_400]},
            {min_quantity: 11, max_quantity: 100, prices: [4_900, 4_400]},
        ],
    },
    {
        productKey: "cloud-storage",
        contractKey: "enterprise",
        terms: [12, 24, 36],
        rows: [
            {min_quantity: 1, max_quantity: 999_999, prices: [14_900, 13_400, 11_900]},
        ],
    },
    {
        productKey: "email-hosting",
        contractKey: "basic",
        terms: [12],
        rows: [
            {min_quantity: 1, max_quantity: 50, prices: [1_900]},
        ],
    },
    {
        productKey: "email-hosting",
        contractKey: "professional",
        terms: [12, 24],
        rows: [
            {min_quantity: 1, max_quantity: 50, prices: [3_900, 3_400]},
        ],
    },
    {
        productKey: "webhosting",
        contractKey: "basic",
        terms: [12],
        rows: [
            {min_quantity: 1, max_quantity: 5, prices: [1_500]},
        ],
    },
    {
        productKey: "webhosting",
        contractKey: "professional",
        terms: [12, 24],
        rows: [
            {min_quantity: 1, max_quantity: 5, prices: [3_200, 2_900]},
            {min_quantity: 6, max_quantity: 25, prices: [2_700, 2_400]},
        ],
    },
    {
        productKey: "ddos-protection",
        contractKey: "professional",
        terms: [12, 24],
        rows: [
            {min_quantity: 1, max_quantity: 999_999, prices: [7_900, 7_200]},
        ],
    },
    {
        productKey: "ddos-protection",
        contractKey: "enterprise",
        terms: [12, 24, 36],
        rows: [
            {min_quantity: 1, max_quantity: 999_999, prices: [15_900, 14_400, 12_900]},
        ],
    },
];

const FLAT_RATES = [
    {
        key: "setup-fee",
        total_cents: 299_00,
        translations: {
            DE: {name: "Einrichtungsgebühr", table: "setup_fee"},
            EN: {name: "Setup fee", table: "setup_fee"},
        },
    },
    {
        key: "migration-service",
        total_cents: 499_00,
        translations: {
            DE: {name: "Migrationsservice", table: "migration"},
            EN: {name: "Migration service", table: "migration"},
        },
    },
];

const CUSTOMERS = [
    {
        customerId: "C-1001",
        companyName: "Musterfirma GmbH",
        email: "info@musterfirma.de",
        street: "Musterstraße 12",
        city: "Musterstadt",
        plz: "12345",
        phone: "+49 123 456789",
        contactPersons: [
            {salutation: "Herr", firstName: "Max", lastName: "Mustermann", email: "max.mustermann@musterfirma.de"},
            {salutation: "Frau", firstName: "Erika", lastName: "Musterfrau", email: "erika.musterfrau@musterfirma.de"},
        ],
    },
    {
        customerId: "C-1002",
        companyName: "Beispiel AG",
        email: "kontakt@beispiel-ag.de",
        street: "Beispielallee 45",
        city: "Beispielburg",
        plz: "54321",
        phone: "+49 987 654321",
        contactPersons: [
            {salutation: "Herr", firstName: "Hans", lastName: "Beispiel", email: "hans.beispiel@beispiel-ag.de"},
        ],
    },
];

/* ───────────────────────────────
   Seed helpers
   ─────────────────────────────── */

async function seedOwner() {
    const existing = await prisma.user.findUnique({
        where: {email: OWNER.email},
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
        where: {email: OWNER.email},
        data: {role: "admin"},
    });

    console.log(`Created owner user: ${OWNER.email}`);
}

async function seedSuppliers() {
    const results = [];
    for (const data of SUPPLIERS) {
        let supplier = await prisma.supplier.findFirst({
            where: {supplierId: data.supplierId},
        });

        if (!supplier) {
            supplier = await prisma.supplier.create({data});
            console.log(`Supplier created: ${supplier.name}`);
        } else {
            console.log(`Supplier exists: ${supplier.name}`);
        }
        results.push(supplier);
    }
    return results;
}

async function seedContracts() {
    const results = [];
    for (const data of CONTRACTS) {
        let contract = await prisma.contract.findUnique({
            where: {key: data.key},
        });

        if (!contract) {
            contract = await prisma.contract.create({
                data: {
                    key: data.key,
                    translations: {
                        create: [
                            {language: "DE", ...data.translations.DE},
                            {language: "EN", ...data.translations.EN},
                        ],
                    },
                },
            });
            console.log(`Contract created: ${data.key}`);
        } else {
            console.log(`Contract exists: ${data.key}`);
        }
        results.push(contract);
    }
    return results;
}

async function seedProducts() {
    const products = [];
    for (const data of PRODUCTS) {
        let product = await prisma.product.findUnique({
            where: {key: data.key},
        });

        if (!product) {
            product = await prisma.product.create({
                data: {
                    key: data.key,
                    translations: {
                        create: [
                            {language: "DE", ...data.translations.DE},
                            {language: "EN", ...data.translations.EN},
                        ],
                    },
                },
            });
            console.log(`Product created: ${data.key}`);
        } else {
            console.log(`Product exists: ${data.key}`);
        }
        products.push(product);
    }

    return products;
}

async function seedTariffs(
    products: {id: string; key: string}[],
    contracts: {id: string; key: string}[],
    customers: {id: string; customerId: string | null; companyName: string}[]
) {
    const productMap = new Map(products.map((p) => [p.key, p.id]));
    const contractMap = new Map(contracts.map((c) => [c.key, c.id]));

    for (const data of TARIFF_DATA) {
        const productId = productMap.get(data.productKey);
        const contractId = contractMap.get(data.contractKey);
        if (!productId || !contractId) continue;

        const existing = await prisma.tariff.findFirst({
            where: {productId, contractId},
        });

        if (existing) {
            console.log(`Tariff exists: ${data.productKey} × ${data.contractKey}`);
            continue;
        }

        const tariff = await prisma.tariff.create({
            data: {productId, contractId, terms: data.terms},
        });

        for (let rowIndex = 0; rowIndex < data.rows.length; rowIndex++) {
            const row = data.rows[rowIndex];
            const tariffRow = await prisma.tariffRow.create({
                data: {
                    tariffId: tariff.id,
                    min_quantity: row.min_quantity,
                    max_quantity: row.max_quantity,
                    order: rowIndex,
                },
            });

            for (let i = 0; i < row.prices.length; i++) {
                await prisma.tariffCell.create({
                    data: {
                        rowId: tariffRow.id,
                        price: row.prices[i],
                        order: i,
                    },
                });
            }
        }

        console.log(
            `Tariff created: ${data.productKey} × ${data.contractKey} (${data.rows.length} rows × ${data.terms.length} terms)`
        );
    }

    // Seed a sample customer-specific price override
    const enterpriseTariff = await prisma.tariff.findFirst({
        where: {productId: productMap.get("managed-server")!, contractId: contractMap.get("enterprise")!},
        include: {rows: {include: {cells: true}}},
    });

    const musterfirma = customers.find((c) => c.companyName === "Musterfirma GmbH");
    if (enterpriseTariff && musterfirma && enterpriseTariff.rows.length > 0) {
        const firstCell = enterpriseTariff.rows[0].cells[0];
        if (firstCell) {
            const existingOverride = await prisma.tariffCellCustomerPrice.findFirst({
                where: {cellId: firstCell.id, customerId: musterfirma.id},
            });
            if (!existingOverride) {
                await prisma.tariffCellCustomerPrice.create({
                    data: {
                        cellId: firstCell.id,
                        customerId: musterfirma.id,
                        price: 15_900,
                    },
                });
                console.log(`Customer price override created: Musterfirma GmbH → Managed Server Enterprise 12M = 15900 ct`);
            }
        }
    }
}

async function seedFlatRates() {
    for (const data of FLAT_RATES) {
        let flatRate = await prisma.flatRate.findUnique({
            where: {key: data.key},
        });

        if (!flatRate) {
            flatRate = await prisma.flatRate.create({
                data: {
                    key: data.key,
                    total_cents: data.total_cents,
                    translations: {
                        create: [
                            {language: "DE", ...data.translations.DE},
                            {language: "EN", ...data.translations.EN},
                        ],
                    },
                },
            });
            console.log(`FlatRate created: ${data.key}`);
        } else {
            console.log(`FlatRate exists: ${data.key}`);
        }
    }
}

async function seedCustomers() {
    const results = [];
    for (const data of CUSTOMERS) {
        const {contactPersons, ...customerData} = data;

        let customer = await prisma.customer.findUnique({
            where: {email: customerData.email},
        });

        if (!customer) {
            customer = await prisma.customer.create({data: customerData});
            console.log(`Customer created: ${customer.companyName}`);
        } else {
            console.log(`Customer exists: ${customer.companyName}`);
        }

        for (const cp of contactPersons) {
            const existing = await prisma.contactPerson.findFirst({
                where: {customerId: customer.id, email: cp.email},
            });

            if (!existing) {
                await prisma.contactPerson.create({
                    data: {...cp, customerId: customer.id},
                });
                console.log(`  ContactPerson created: ${cp.firstName} ${cp.lastName}`);
            } else {
                console.log(`  ContactPerson exists: ${cp.firstName} ${cp.lastName}`);
            }
        }
        results.push(customer);
    }
    return results;
}

/* ───────────────────────────────
   Main
   ─────────────────────────────── */

async function main() {
    await seedOwner();

    const suppliers = await seedSuppliers();
    const contracts = await seedContracts();
    const products = await seedProducts();
    const customers = await seedCustomers();
    await seedTariffs(products, contracts, customers);
    await seedFlatRates();

    console.log("\nSeed finished successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
