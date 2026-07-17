import { useMemo, useState } from "react";

const sortOptions = [
    { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
    { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
];


export default function useOfferFilters() {
    const [searchInput, setSearchInput] = useState("");
    const [sort, setSort] = useState(sortOptions[0].value);
    const [customerFilter, setCustomerFilter] = useState<Array<string>>([]);
    const [contactPersonFilter, setContactPersonFilter] = useState<Array<string>>([]);
    const [productFilter, setProductFilter] = useState<Array<string>>([]);

    const params = useMemo(() => ({
        search: searchInput || undefined,
        companyIds: customerFilter.length > 0 ? customerFilter : undefined,
        contactPersonIds: contactPersonFilter.length > 0 ? contactPersonFilter : undefined,
        productIds: productFilter.length > 0 ? productFilter : undefined,
        sort,
    }), [searchInput, customerFilter, contactPersonFilter, productFilter, sort]);

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
    };
}