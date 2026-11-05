import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import FlatRateItem from "./flatrate-item";
import type { Flatrate } from "@keepit/schemas";
import i18n from "@/i18n";
import { plain } from "@/lib/format.test-utils";

vi.mock("@/hooks/flatrates/flatrate-mutations", () => ({
    useDeleteFlatRate: () => ({ deleteFlatRate: vi.fn(), isDeletingFlatRate: false }),
}));

const flatrate = {
    id: "f1",
    totalCents: 123456,
    createdAt: "2026-10-20T12:00:00Z",
    translations: [],
} as unknown as Flatrate;

describe("FlatRateItem", () => {
    afterEach(async () => {
        await i18n.changeLanguage("de");
    });

    it("schreibt die Gesamtsumme in der aktiven Sprache", async () => {
        await act(() => i18n.changeLanguage("de"));
        render(<FlatRateItem flatrate={flatrate} onEdit={() => {}} />);

        const total = screen.getByText((text) => plain(text) === "1.234,56 €");

        await act(() => i18n.changeLanguage("en"));

        expect(plain(total.textContent)).toBe("€1,234.56");
    });
});
