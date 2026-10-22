import { act, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";
import CustomerModal from "./customer-modal";
import i18n from "@/i18n";

function renderModal() {
    return render(
        <QueryClientProvider client={new QueryClient()}>
            <CustomerModal onClose={() => {}} />
        </QueryClientProvider>,
    );
}

describe("CustomerModal", () => {
    afterEach(async () => {
        await i18n.changeLanguage("de");
    });

    it("meldet Validierungsfehler in der aktiven Sprache", async () => {
        await act(() => i18n.changeLanguage("de"));
        renderModal();

        fireEvent.change(await screen.findByLabelText("Firmenname"), { target: { value: "x" } });
        fireEvent.change(screen.getByLabelText("Firmenname"), { target: { value: "" } });
        fireEvent.change(screen.getByLabelText("E-Mail"), { target: { value: "kein-mail" } });
        fireEvent.click(screen.getByText("Ansprechpartner hinzufügen"));

        expect(await screen.findByText("Mindestens 1 Zeichen")).toBeTruthy();
        expect(screen.getByText("Ungültige E-Mail-Adresse")).toBeTruthy();
        expect(await screen.findByText("Anrede fehlt")).toBeTruthy();

        await act(() => i18n.changeLanguage("en"));

        expect(screen.getByText("At least 1 character")).toBeTruthy();
        expect(screen.getByText("Invalid email address")).toBeTruthy();
        expect(screen.getByText("Salutation missing")).toBeTruthy();
        expect(screen.getByText("Create new customer")).toBeTruthy();
        expect(screen.getByLabelText("Company name")).toBeTruthy();
    });
});
