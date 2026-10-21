import { useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DATE_SORTS, useSortOptions } from "@/lib/sort-options";

export default function useEmployeeFilters() {
    const urlSearch = useSearch({ strict: false });

    const [searchQuery, setSearchQuery] = useState<string>(urlSearch.search ?? "");
    const sortOptions = useSortOptions(DATE_SORTS);
    const [sort, setSort] = useState<string>(DATE_SORTS[0]);

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

export type EmployeeFilter = ReturnType<typeof useEmployeeFilters>;