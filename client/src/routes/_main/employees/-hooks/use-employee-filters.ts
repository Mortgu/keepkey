import { useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DATE_SORTS, useSort } from "@/lib/sort-options";

export default function useEmployeeFilters() {
    const urlSearch = useSearch({ strict: false });

    const [searchQuery, setSearchQuery] = useState<string>(urlSearch.search ?? "");
    const { sort, setSort, sortOptions } = useSort(DATE_SORTS);

    const params = useMemo(() => ({
        search: searchQuery || undefined,
        sort,
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

export type EmployeeFilter = ReturnType<typeof useEmployeeFilters>;