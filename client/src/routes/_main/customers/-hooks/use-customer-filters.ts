import { useMemo, useState } from "react";
import { useSearch } from "@tanstack/react-router";

const sortOptions = [
    { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
    { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
    { value: "companyName:asc", label: "Name A–Z" },
    { value: "companyName:desc", label: "Name Z–A" },
];

export default function useCustomerFilters() {
    const urlSearch = useSearch({ strict: false });
    const [searchInput, setSearchInput] = useState(urlSearch.search ?? "");
    const [sort, setSort] = useState(sortOptions[0].value);
    const [countryFilter, setCountryFilter] = useState<Array<string>>([]);
    const [languageFilter, setLanguageFilter] = useState<Array<string>>([]);

    const params = useMemo(() => ({
        search: searchInput || undefined,
        sort,
    }), [searchInput, sort]);

    const removeCountryFilter = (value: string) =>
        setCountryFilter((prev) => prev.filter((i) => i !== value));

    const removeLanguageFilter = (value: string) =>
        setLanguageFilter((prev) => prev.filter((i) => i !== value));

    const activeFilterCount = countryFilter.length + languageFilter.length;

    return {
        sortOptions,
        sort,
        setSort,
        searchInput,
        setSearchInput,
        countryFilter,
        setCountryFilter,
        removeCountryFilter,
        languageFilter,
        setLanguageFilter,
        removeLanguageFilter,
        activeFilterCount,
        params,
    };
}
