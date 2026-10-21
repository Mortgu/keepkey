import { act, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";
import ContactModal from "./contact-modal";
import i18n from "@/i18n";

function renderModal() {
    return render(
        <QueryClientProvider client={new QueryClient()}>
            <ContactModal customerId="c1" onClose={() => {}} />
        </QueryClientProvider>,
    );
}

describe("ContactModal", () => {
    afterEach(async () => {
        await i18n.changeLanguage("de");
    });

    it("meldet fehlende Pflichtangaben in der aktiven Sprache", async () => {
        await act(() => i18n.changeLanguage("de"));
        renderModal();

        expect(await screen.findByText("Anrede fehlt")).toBeTruthy();
        expect(screen.getByText("Vorname fehlt")).toBeTruthy();
        expect(screen.getByText("Nachname fehlt")).toBeTruthy();
        expect(screen.getByText("Kontaktperson hinzufügen")).toBeTruthy();

        await act(() => i18n.changeLanguage("en"));

        expect(screen.getByText("Salutation missing")).toBeTruthy();
        expect(screen.getByText("First name missing")).toBeTruthy();
        expect(screen.getByText("Last name missing")).toBeTruthy();
        expect(screen.getByText("Add contact person")).toBeTruthy();
        expect(screen.getByText("First name")).toBeTruthy();
    });
});
