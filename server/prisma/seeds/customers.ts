import type { Customer, PrismaClient } from "@prisma/client";

const CUSTOMERS = [
    {
        customerId: "C-1001",
        companyName: "Musterfirma GmbH",
        email: "info@musterfirma.de",
        street: "Musterstraße 12",
        city: "Musterstadt",
        zip: "12345",
        phone: "+49 123 456789",
        contactPersons: [
            {
                salutation: "Herr",
                firstName: "Max",
                lastName: "Mustermann",
                email: "max.mustermann@musterfirma.de"
            },
            {
                salutation: "Frau",
                firstName: "Erika",
                lastName: "Musterfrau",
                email: "erika.musterfrau@musterfirma.de"
            },
        ],
    },
    {
        customerId: "C-1002",
        companyName: "Beispiel AG",
        email: "kontakt@beispiel-ag.de",
        street: "Beispielallee 45",
        city: "Beispielburg",
        zip: "54321",
        phone: "+49 987 654321",
        contactPersons: [
            {
                salutation: "Herr",
                firstName: "Hans",
                lastName: "Beispiel",
                email: "hans.beispiel@beispiel-ag.de"
            },
        ],
    },
];

export async function seedCustomers(prisma: PrismaClient): Promise<Customer[]> {
    const results: Customer[] = [];

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
