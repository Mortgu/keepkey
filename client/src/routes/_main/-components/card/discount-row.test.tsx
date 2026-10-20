import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import DiscountRow from "./discount-row";
import i18n from "@/i18n";

/** Intl setzt geschützte Leerzeichen (U+00A0, U+202F); für den Vergleich zählen sie als normale. */
const plain = (s: string | null) => (s ?? "").replace(/[\u00A0\u202F]/g, " ");

describe("DiscountRow", () => {
    afterEach(async () => {
        await i18n.changeLanguage("de");
    });

    it("zeigt den Betrag nach einem Sprachwechsel ohne Neuaufbau im neuen Format", async () => {
        await act(() => i18n.changeLanguage("de"));
        render(<DiscountRow discount={{ title: "Treuerabatt", description: "", amount_cents: 123456 }} />);

        const amount = screen.getByText((text) => plain(text) === "-1.234,56 €");

        await act(() => i18n.changeLanguage("en"));

        expect(plain(amount.textContent)).toBe("-€1,234.56");
        expect(amount.isConnected).toBe(true);
    });
});
