import { useCustomers } from "@/hooks";
import { useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";

const sortOptions = [
    { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
    { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
    { value: "companyName:asc", label: "Name A–Z" },
    { value: "companyName:desc", label: "Name Z–A" },
];

export function useCustomerFilters() {
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

export type CustomerFilters = ReturnType<typeof useCustomerFilters>;

export function useCustomerPage() {
    const filters = useCustomerFilters();
    const { customers, isPending, error } = useCustomers(filters.params);

    const filteredCustomers = useMemo(
        () => customers.filter((c) => {
            if (filters.countryFilter.length > 0 && !filters.countryFilter.includes(c.country)) return false;
            if (filters.languageFilter.length > 0 && !filters.languageFilter.includes(c.language)) return false;
            return true;
        }),
        [customers, filters.countryFilter, filters.languageFilter]
    );

    return { filters, isPending, error, customers: filteredCustomers };
}