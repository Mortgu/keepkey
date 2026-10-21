import { useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DATE_SORTS, useSort } from "@/lib/sort-options";

export default function useWorkloadFilters() {
    const urlSearch = useSearch({ strict: false });
    const [searchInput, setSearchInput] = useState(urlSearch.search ?? "");
    const { sort, setSort, sortOptions } = useSort(DATE_SORTS);

    const params = useMemo(() => ({
        search: searchInput || undefined,
        sort,
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
