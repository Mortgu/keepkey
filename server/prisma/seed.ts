import { auth } from "../src/lib/auth.js";
import { prisma } from "../src/lib/prismaClient.js";

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
    { supplierId: "SUP-001", name: "Dignum IT-Services GmbH" },
    { supplierId: "SUP-002", name: "CloudHosting AG" },
];

const CONTRACTS = [
    {
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
        translations: {
            DE: {
                name: "E-Mail Hosting",
                description: "Business-E-Mail mit Exchange- und IMAP-Unterstützung",
                table: "email"
            },
            EN: { name: "Email Hosting", description: "Business email with Exchange and IMAP support", table: "email" },
        },
    },
    {
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
        translations: {
            DE: { name: "DDoS Protection", description: "Edge-Schutz gegen DDoS-Angriffe", table: "security" },
            EN: { name: "DDoS Protection", description: "Edge protection against DDoS attacks", table: "security" },
        },
    },
];

const FLAT_RATES = [
    {
        total_cents: 299_00,
        translations: {
            DE: { name: "Einrichtungsgebühr", table: "setup_fee" },
            EN: { name: "Setup fee", table: "setup_fee" },
        },
    },
    {
        total_cents: 499_00,
        translations: {
            DE: { name: "Migrationsservice", table: "migration" },
            EN: { name: "Migration service", table: "migration" },
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
            { salutation: "Herr", firstName: "Max", lastName: "Mustermann", email: "max.mustermann@musterfirma.de" },
            { salutation: "Frau", firstName: "Erika", lastName: "Musterfrau", email: "erika.musterfrau@musterfirma.de" },
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
            { salutation: "Herr", firstName: "Hans", lastName: "Beispiel", email: "hans.beispiel@beispiel-ag.de" },
        ],
    },
];

/* ───────────────────────────────
   Seed helpers
   ─────────────────────────────── */

async function seedOwner() {
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

async function seedSuppliers() {
    const results = [];
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

async function seedContracts() {
    const results = [];
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

async function seedProducts() {
    const products = [];
    for (const data of PRODUCTS) {
        let product = await prisma.product.findFirst({
            where: {
                translations: {
                    some: { language: "DE", name: data.translations.DE.name },
                },
            },
            include: { translations: true },
        });

        if (!product) {
            product = await prisma.product.create({
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
            console.log(`Product created: ${data.translations.DE.name}`);
        } else {
            console.log(`Product exists: ${data.translations.DE.name}`);
        }
        products.push(product);
    }

    return products;
}

async function seedTariffs(
    products: { id: string; translations: { name: string }[] }[],
    contracts: { id: string; translations: { name: string }[] }[],
    customers: { id: string; customerId: string | null; companyName: string }[]
) {
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
            data: { tariffId: tariff.id, duration: 12 },
        });
        const column24 = await prisma.tariffColumn.create({
            data: { tariffId: tariff.id, duration: 24 },
        });

        // 4. Rows (Mengenbereiche)
        const rowSmall = await prisma.tariffRow.create({
            data: { tariffId: tariff.id, min_quantity: 1, max_quantity: 10 },
        });
        const rowLarge = await prisma.tariffRow.create({
            data: { tariffId: tariff.id, min_quantity: 11, max_quantity: null },
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

async function seedFlatRates() {
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
    }
}

async function seedCustomers() {
    const results = [];
    for (const data of CUSTOMERS) {
        const { contactPersons, ...customerData } = data;

        let customer = await prisma.customer.findUnique({
            where: { email: customerData.email },
        });

        if (!customer) {
            customer = await prisma.customer.create({ data: customerData });
            console.log(`Customer created: ${customer.companyName}`);
        } else {
            console.log(`Customer exists: ${customer.companyName}`);
        }

        for (const cp of contactPersons) {
            const existing = await prisma.contactPerson.findFirst({
                where: { customerId: customer.id, email: cp.email },
            });

            if (!existing) {
                await prisma.contactPerson.create({
                    data: { ...cp, customerId: customer.id },
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
