import { prisma } from "../src/lib/prisma";
import { auth } from "../src/lib/auth";

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
    { name: "Basic", features: ["E-Mail-Support", "8×5 Verfügbarkeit", "Standard-SLA"], table: "contract_basic" },
    { name: "Professional", features: ["Telefon- & E-Mail-Support", "24×7 Verfügbarkeit", "Premium-SLA", "Priorisierte Bearbeitung"], table: "contract_pro" },
    { name: "Enterprise", features: ["Dedizierter Account Manager", "24×7 Verfügbarkeit", "Enterprise-SLA", "On-Site Support", "Custom Development"], table: "contract_enterprise" },
];

const PRODUCTS = [
    { name: "Managed Server", description: "Vollständig verwalteter Server inkl. Backup & Monitoring", table: "server" },
    { name: "Cloud Storage", description: "Skalierbarer Objektspeicher mit S3-kompatibler API", table: "storage" },
    { name: "E-Mail Hosting", description: "Business-E-Mail mit Exchange- und IMAP-Unterstützung", table: "email" },
    { name: "Webhosting", description: "Shared-Hosting mit PHP, MySQL und SSL-Zertifikat", table: "webhosting" },
    { name: "DDoS Protection", description: "Edge-Schutz gegen DDoS-Angriffe", table: "security" },
];

/** Price in cents (Euro) */
const TARIFF_CONFIGS = [
    // Basic
    { contractName: "Basic", duration: 12, min_quantity: 1, max_quantity: 5, price: 4_900 },
    { contractName: "Basic", duration: 12, min_quantity: 6, max_quantity: 25, price: 3_900 },
    { contractName: "Basic", duration: 24, min_quantity: 1, max_quantity: 5, price: 4_400 },
    // Professional
    { contractName: "Professional", duration: 12, min_quantity: 1, max_quantity: 10, price: 9_900 },
    { contractName: "Professional", duration: 12, min_quantity: 11, max_quantity: 50, price: 8_400 },
    { contractName: "Professional", duration: 24, min_quantity: 1, max_quantity: 10, price: 8_900 },
    // Enterprise
    { contractName: "Enterprise", duration: 12, min_quantity: 1, max_quantity: null, price: 19_900 },
    { contractName: "Enterprise", duration: 24, min_quantity: 1, max_quantity: null, price: 17_900 },
];

const FLAT_RATES = [
    { name: "Einrichtungsgebühr", table: "setup_fee", total_cents: 299_00 },
    { name: "Migrationsservice", table: "migration", total_cents: 499_00 },
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
            where: { name: data.name },
        });

        if (!contract) {
            contract = await prisma.contract.create({ data });
            console.log(`Contract created: ${contract.name}`);
        } else {
            console.log(`Contract exists: ${contract.name}`);
        }
        results.push(contract);
    }
    return results;
}

async function seedProductsAndTariff() {
    const tariff = await prisma.tariff.findFirst({
        where: { id: "seed-main-tariff" },
    });

    let existingTariff = tariff;
    if (!existingTariff) {
        existingTariff = await prisma.tariff.create({ data: { id: "seed-main-tariff" } });
        console.log(`Tariff created: ${existingTariff.id}`);
    } else {
        console.log(`Tariff exists: ${existingTariff.id}`);
    }

    const products = [];
    for (const data of PRODUCTS) {
        let product = await prisma.product.findUnique({
            where: { name: data.name },
        });

        if (!product) {
            product = await prisma.product.create({
                data: { ...data, tariffId: existingTariff.id },
            });
            console.log(`Product created: ${product.name}`);
        } else {
            console.log(`Product exists: ${product.name}`);
        }
        products.push(product);
    }

    return { tariff: existingTariff, products };
}

async function seedTariffConfigs(tariffId: string, contracts: { id: string; name: string }[]) {
    const contractMap = new Map(contracts.map((c) => [c.name, c.id]));

    for (const cfg of TARIFF_CONFIGS) {
        const contractId = contractMap.get(cfg.contractName);
        if (!contractId) continue;

        const existing = await prisma.tariffConfig.findUnique({
            where: {
                tariffId_contractId_duration_min_quantity: {
                    tariffId,
                    contractId,
                    duration: cfg.duration,
                    min_quantity: cfg.min_quantity,
                },
            },
        });

        if (!existing) {
            await prisma.tariffConfig.create({
                data: {
                    tariffId,
                    contractId,
                    duration: cfg.duration,
                    min_quantity: cfg.min_quantity,
                    max_quantity: cfg.max_quantity,
                    price: cfg.price,
                },
            });
            console.log(
                `TariffConfig created: ${cfg.contractName} / ${cfg.duration}M / qty ${cfg.min_quantity}${cfg.max_quantity ? `-${cfg.max_quantity}` : "+"} = ${cfg.price} ct`
            );
        } else {
            console.log(
                `TariffConfig exists: ${cfg.contractName} / ${cfg.duration}M / qty ${cfg.min_quantity}${cfg.max_quantity ? `-${cfg.max_quantity}` : "+"} = ${cfg.price} ct`
            );
        }
    }
}

async function seedFlatRates() {
    for (const data of FLAT_RATES) {
        let flatRate = await prisma.flatRate.findFirst({
            where: { name: data.name },
        });

        if (!flatRate) {
            flatRate = await prisma.flatRate.create({ data });
            console.log(`FlatRate created: ${flatRate.name}`);
        } else {
            console.log(`FlatRate exists: ${flatRate.name}`);
        }
    }
}

async function seedCustomers() {
    for (const data of CUSTOMERS) {
        const { contactPersons, ...customerData } = data;

        let customer = await prisma.customer.findUnique({
            where: { customerId: customerData.customerId },
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
    }
}

/* ───────────────────────────────
   Main
   ─────────────────────────────── */

async function main() {
    await seedOwner();

    const suppliers = await seedSuppliers();
    const contracts = await seedContracts();
    const { tariff, products } = await seedProductsAndTariff();
    await seedTariffConfigs(tariff.id, contracts);
    await seedFlatRates();
    await seedCustomers();

    console.log("\nSeed finished successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
