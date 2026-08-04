import { useMemo, useState } from "react";
import { useSearch } from "@tanstack/react-router";

const sortOptions = [
    { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
    { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
];

interface Options {
    customerId?: string;
}

export default function useOfferFilters({ customerId }: Options = {}) {
    const urlSearch = useSearch({ strict: false });
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const [searchInput, setSearchInput] = useState(urlSearch.search ?? "");
    const [sort, setSort] = useState(sortOptions[0].value);
    const [customerFilter, setCustomerFilter] = useState<Array<string>>([]);
    const [contactPersonFilter, setContactPersonFilter] = useState<Array<string>>([]);
    const [productFilter, setProductFilter] = useState<Array<string>>([]);

    const allCustomersIds = useMemo(
        () => [...(customerId ? [customerId] : []), ...customerFilter],
        [customerId, customerFilter]
    );

    const params = useMemo(() => ({
        search: searchInput || undefined,
        companyIds: allCustomersIds.length > 0 ? allCustomersIds : undefined,
        contactPersonIds: contactPersonFilter.length > 0 ? contactPersonFilter : undefined,
        productIds: productFilter.length > 0 ? productFilter : undefined,
        sort,
        limit: 50,
    }), [searchInput, allCustomersIds, contactPersonFilter, productFilter, sort]);

    const removeCustomerFilter = (id: string) =>
        setCustomerFilter((prev) => prev.filter((i) => i !== id));

    const removeContactPersonFilter = (id: string) =>
        setContactPersonFilter((prev) => prev.filter((i) => i !== id));

    const removeProductFilter = (id: string) =>
        setProductFilter((prev) => prev.filter((i) => i !== id));

    const activeFilterCount = customerFilter.length + contactPersonFilter.length + productFilter.length;

    return {
        sortOptions,
        sort,
        setSort,
        searchInput,
        setSearchInput,
        customerFilter,
        setCustomerFilter,
        removeCustomerFilter,
        contactPersonFilter,
        setContactPersonFilter,
        removeContactPersonFilter,
        productFilter,
        setProductFilter,
        removeProductFilter,
        activeFilterCount,
        params,
        customerId,
    };
}

export type OfferFilters = ReturnType<typeof useOfferFilters>;