import { useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";

const sortOptions = [
    { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
    { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
];

interface Props {
    customerId?: string;
}

export default function useOrderFilters({ customerId }: Props = {}) {
    const urlSearch = useSearch({ strict: false });

    const [searchQuery, setSearchQuery] = useState<string>(urlSearch.search || "");
    const [sort, setSort] = useState(sortOptions[0].value);

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