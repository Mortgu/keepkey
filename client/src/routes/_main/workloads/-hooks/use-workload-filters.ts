import { useSearch } from "@tanstack/react-router";
import { useState } from "react";

const sortOptions = [
    { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
    { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
];

export default function useWorkloadFilters() {
    const urlSearch = useSearch({ strict: false });

    const [searchInput, setSearchInput] = useState(urlSearch.search ?? "");
    const [sort, setSort] = useState(sortOptions[0].value);

    return {
        sortOptions,

        sort,
        setSort,

        searchInput,
        setSearchInput,
    }
}

export type WorkloadFilters = ReturnType<typeof useWorkloadFilters>;