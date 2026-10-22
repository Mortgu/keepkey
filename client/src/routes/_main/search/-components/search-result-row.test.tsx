import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import SearchResultRow from "./search-result-row";
import type { SearchResultItem } from "@keepit/schemas";
import i18n from "@/i18n";
import { plain } from "@/lib/format.test-utils";

const item = {
    type: "offer",
    title: "Angebot 42",
    meta: "Muster GmbH",
    updatedAt: "2020-01-15T12:00:00Z",
} as unknown as SearchResultItem;

describe("SearchResultRow", () => {
    afterEach(async () => {
        await i18n.changeLanguage("de");
    });

    it("schreibt ältere Treffer mit dem Datum in der aktiven Sprache", async () => {
        await act(() => i18n.changeLanguage("de"));
        render(<SearchResultRow item={item} query="" onSelect={() => {}} />);

        const date = screen.getByText((text) => plain(text) === "15. Januar 2020");

        await act(() => i18n.changeLanguage("en"));

        expect(plain(date.textContent)).toBe("15 January 2020");
    });
});
