import type { OfferFetchData } from "./build-offer.js";

const at = (iso: string) => new Date(`${iso}T12:00:00.000Z`);
const t = (language: "DE" | "EN", name: string, extra: Record<string, unknown> = {}) =>
    ({ language, name, description: null, table: null, ...extra });

const contract = (id: string, de: string, en: string, features: string[]) => ({
    id,
    translations: [
        { language: "DE", name: de, features, table: "" },
        { language: "EN", name: en, features, table: "" },
    ],
});

/** Zwei Positionen (eine mit Freimonaten, eine optional), Flatrate, Rabatt, zwei Vergleichsverträge. */
export function offerFixture(overrides: {
    language?: "DE" | "EN";
    featureComparison?: boolean;
    acceptedSnapshot?: unknown;
    customerCompanyName?: string;
    productName?: string;
} = {}): OfferFetchData {
    const base = contract("c-base", "Basic", "Basic", ["Backup"]);
    const plus = contract("c-plus", "Plus", "Plus", ["Backup", "Restore"]);
    const broken = contract("c-broken", "Broken", "Broken", ["x"]);
    const productName = overrides.productName ?? "Microsoft 365";

    return {
        offer: {
            id: "o-1",
            quoteId: "AG-0001",
            language: overrides.language ?? "DE",
            customerId: "cust-1",
            contractId: "c-base",
            duration_months: 24,
            date: at("2026-10-01"),
            validUntil: at("2026-11-01"),
            requestFrom: at("2026-09-15"),
            paymentTerm: "30 Tage",
            supplierId: "SUP-1",
            featureComparison: overrides.featureComparison ?? true,
            acceptedSnapshot: overrides.acceptedSnapshot ?? null,
            contract: base,
            customer: {
                customerId: "K-100", companyName: overrides.customerCompanyName ?? "ACME GmbH", street: "Weg 1", zip: "12345",
                city: "Berlin", phone: "030 1", email: "info@acme.test",
            },
            customerContactPerson: {
                salutation: "Frau", firstName: "Anna", lastName: "Muster", email: "anna@acme.test",
            },
            user: {
                salutation: "Herr", firstName: "Max", lastName: "Verkauf", phone: null, email: "max@keepit.test",
            },
            offerPositions: [
                {
                    id: "p-1", productId: "prod-1", quantity: 10, free_months: 2, optional: false,
                    eur_user_month: 500, total_cents: 120000, discount_cents: 10000,
                    product: { translations: [t("DE", productName, { description: "M365", table: "Tabelle M365" }), t("EN", productName)] },
                },
                {
                    id: "p-2", productId: "prod-2", quantity: 5, free_months: 0, optional: true,
                    eur_user_month: 300, total_cents: 36000, discount_cents: 0,
                    product: { translations: [t("DE", "Salesforce"), t("EN", "Salesforce")] },
                },
            ],
            offerFlatRates: [
                { total_cents: 25000, flatRate: { translations: [t("DE", "Setup", { table: "Setup-Tabelle" }), t("EN", "Setup", { table: "Setup table" })] } },
            ],
            offerDiscounts: [
                { title: "Treuerabatt", description: null, amount_cents: 5000 },
            ],
        },
        contracts: [base, plus, broken],
    } as unknown as OfferFetchData;
}
