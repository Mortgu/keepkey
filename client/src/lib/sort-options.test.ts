import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DATE_AND_NAME_SORTS, DATE_SORTS, sortItems, useSort, useSortOptions } from "./sort-options";
import i18n from "@/i18n";

const items = [
    { id: "b", companyName: "Beta GmbH", createdAt: "2026-02-01T00:00:00Z" },
    { id: "c", companyName: "alpha AG", createdAt: "2026-03-01T00:00:00Z" },
    { id: "a", companyName: "Gamma KG", createdAt: "2026-01-01T00:00:00Z" },
];

const ids = (list: Array<{ id: string }>) => list.map((i) => i.id);

describe("sortItems", () => {
    it("Datum – neuestes zuerst", () => {
        expect(ids(sortItems(items, "createdAt:desc"))).toEqual(["c", "b", "a"]);
    });

    it("Datum – ältestes zuerst", () => {
        expect(ids(sortItems(items, "createdAt:asc"))).toEqual(["a", "b", "c"]);
    });

    it("Name A–Z ohne Rücksicht auf Groß-/Kleinschreibung", () => {
        expect(ids(sortItems(items, "companyName:asc"))).toEqual(["c", "b", "a"]);
    });

    it("Name Z–A", () => {
        expect(ids(sortItems(items, "companyName:desc"))).toEqual(["a", "b", "c"]);
    });

    it("lässt die Eingabeliste unverändert", () => {
        const before = ids(items);
        sortItems(items, "createdAt:desc");
        expect(ids(items)).toEqual(before);
    });
});

describe("useSortOptions", () => {
    afterEach(async () => {
        await i18n.changeLanguage("de");
    });

    it("beschriftet die Optionen auf Deutsch und nach Sprachwechsel auf Englisch", async () => {
        await act(() => i18n.changeLanguage("de"));
        const { result } = renderHook(() => useSortOptions(DATE_AND_NAME_SORTS));

        expect(result.current.map((o) => o.label)).toEqual([
            "Datum – neuestes zuerst",
            "Datum – ältestes zuerst",
            "Name A–Z",
            "Name Z–A",
        ]);

        await act(() => i18n.changeLanguage("en"));

        expect(result.current.map((o) => o.label)).toEqual([
            "Date – newest first",
            "Date – oldest first",
            "Name A–Z",
            "Name Z–A",
        ]);
        expect(result.current.map((o) => o.value)).toEqual([
            "createdAt:desc", "createdAt:asc", "companyName:asc", "companyName:desc",
        ]);
    });
});

describe("useSort", () => {
    it("startet mit der ersten Option, liefert die Optionen und übernimmt eine neue Auswahl", () => {
        const { result } = renderHook(() => useSort(DATE_SORTS));

        expect(result.current.sort).toBe("createdAt:desc");
        expect(result.current.sortOptions.map((o) => o.value)).toEqual(["createdAt:desc", "createdAt:asc"]);

        act(() => result.current.setSort("createdAt:asc"));

        expect(result.current.sort).toBe("createdAt:asc");
    });
});
