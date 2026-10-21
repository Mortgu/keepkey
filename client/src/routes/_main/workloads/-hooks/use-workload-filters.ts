import { useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DATE_SORTS, useSortOptions } from "@/lib/sort-options";

export default function useWorkloadFilters() {
    const urlSearch = useSearch({ strict: false });
    const [searchInput, setSearchInput] = useState(urlSearch.search ?? "");
    const sortOptions = useSortOptions(DATE_SORTS);
    const [sort, setSort] = useState<string>(DATE_SORTS[0]);

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
