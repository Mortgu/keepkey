import { useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DATE_SORTS, useSortOptions } from "@/lib/sort-options";

interface Props {
    customerId?: string;
}

export default function useOrderFilters({ customerId }: Props = {}) {
    const urlSearch = useSearch({ strict: false });

    const [searchQuery, setSearchQuery] = useState<string>(urlSearch.search || "");
    const sortOptions = useSortOptions(DATE_SORTS);
    const [sort, setSort] = useState<string>(DATE_SORTS[0]);

    const [customerFilter, setCustomerFilter] = useState<Array<string>>([]);

    const allCustomersIds = useMemo(() => [
        ...(customerId ? [customerId] : []), ...customerFilter,
    ], [customerId, customerFilter]);

    const params = useMemo(() => ({
        search: searchQuery || undefined,
        companyIds: allCustomersIds.length > 0 ? allCustomersIds : undefined,
        sort: sort || undefined,
    }), [searchQuery, allCustomersIds, sort]);

    const removeCustomerFilter = (id: string) =>
        setCustomerFilter((prev) => prev.filter((i) => i !== id));

    return {
        sortOptions,

        sort,
        setSort,
        searchQuery,
        setSearchQuery,
        customerFilter,
        setCustomerFilter,
        removeCustomerFilter,

        params,
    }
}

export type OrderFilters = ReturnType<typeof useOrderFilters>;