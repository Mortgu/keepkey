import { useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";

const sortOptions = [
    { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
    { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
];

export default function useSupplierFilters() {
    const urlSearch = useSearch({ strict: false });

    const [searchQuery, setSearchQuery] = useState<string>(urlSearch.search ?? "");
    const [sort, setSort] = useState(sortOptions[0].value);

    const params = useMemo(() => ({
        search: searchQuery || undefined,
        sort: sort || undefined,
    }), [searchQuery, sort]);

    return {
        sortOptions,

        searchQuery,
        setSearchQuery,
        sort,
        setSort,

        params,
    }
}

export type SupplierFilter = ReturnType<typeof useSupplierFilters>;