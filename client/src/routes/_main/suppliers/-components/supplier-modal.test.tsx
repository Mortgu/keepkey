import { act, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it } from "vitest";
import SupplierModal from "./supplier-modal";
import i18n from "@/i18n";

function renderModal() {
    return render(
        <QueryClientProvider client={new QueryClient()}>
            <SupplierModal onClose={() => {}} />
        </QueryClientProvider>,
    );
}

describe("SupplierModal", () => {
    afterEach(async () => {
        await i18n.changeLanguage("de");
    });

    it("meldet einen fehlenden Namen in der aktiven Sprache", async () => {
        await act(() => i18n.changeLanguage("de"));
        renderModal();

        expect(await screen.findByText("Pflichtfeld")).toBeTruthy();

        await act(() => i18n.changeLanguage("en"));

        expect(screen.getByText("Required")).toBeTruthy();
    });
});
