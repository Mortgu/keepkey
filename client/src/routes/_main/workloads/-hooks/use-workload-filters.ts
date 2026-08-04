import { useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";

const sortOptions = [
    { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
    { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
];

export default function useWorkloadFilters() {
    const urlSearch = useSearch({ strict: false });
    const [searchInput, setSearchInput] = useState(urlSearch.search ?? "");
    const [sort, setSort] = useState<string>(sortOptions[0].value);

    const params = useMemo(() => ({
        search: searchInput || undefined,
        sort: sort as "createdAt:asc" | "createdAt:desc",
    }), [searchInput, sort]);

    return {
        sortOptions,

        sort,
        setSort,

        searchInput,
        setSearchInput,

        params,
    }
}

export type WorkloadFilters = ReturnType<typeof useWorkloadFilters>;
