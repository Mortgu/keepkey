import { act, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";
import CustomerPricesTab from "./customer-prices-tab";
import type { Customer, CustomerPriceRow } from "@keepit/schemas";
import { pricingKeys } from "@/hooks/pricing/pricing-keys";
import i18n from "@/i18n";

const customer = { id: "c1" } as Customer;

/** Gruppenweiter Altbestand an einer verwaisten Staffel. */
const orphanRow = {
    id: "p1",
    contract: { translations: [{ language: "DE", name: "Backup" }] },
    product: null,
    duration: 12,
    min_quantity: 11,
    max_quantity: null,
    reachable: false,
    price: 1000,
    list_price: null,
} as unknown as CustomerPriceRow;

function renderTab() {
    const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
    client.setQueryData(pricingKeys.customerPrices(customer.id), [orphanRow]);
    return render(
        <QueryClientProvider client={client}>
            <CustomerPricesTab customer={customer} />
        </QueryClientProvider>,
    );
}

describe("CustomerPricesTab", () => {
    afterEach(async () => {
        await i18n.changeLanguage("de");
    });

    it("beschriftet Tabelle und Preiszeilen in der aktiven Sprache", async () => {
        await act(() => i18n.changeLanguage("de"));
        renderTab();

        expect(screen.getByText("Kundenpreis")).toBeTruthy();
        expect(screen.getByText("12 Monate")).toBeTruthy();
        expect(screen.getByText("ab 11")).toBeTruthy();
        expect(screen.getByText("Staffel fehlt")).toBeTruthy();
        expect(screen.getByText("alle Produkte der Gruppe")).toBeTruthy();

        await act(() => i18n.changeLanguage("en"));

        expect(screen.getByText("Customer price")).toBeTruthy();
        expect(screen.getByText("12 months")).toBeTruthy();
        expect(screen.getByText("from 11")).toBeTruthy();
        expect(screen.getByText("Tier missing")).toBeTruthy();
        expect(screen.getByText("all products of the group")).toBeTruthy();
    });
});
