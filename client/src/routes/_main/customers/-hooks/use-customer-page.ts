import { useMemo } from "react";
import useCustomerFilters from "./use-customer-filters";
import { useCustomers } from "@/hooks";

export default function useCustomerPage() {
    const filters = useCustomerFilters();
    const { customers, isPending, error } = useCustomers(filters.params);

    const filteredCustomers = useMemo(
        () => customers.filter((c) => {
            if (filters.countryFilter.length > 0 && !filters.countryFilter.includes(c.country)) return false;
            if (filters.languageFilter.length > 0 && !filters.languageFilter.includes(c.language)) return false;
            return true;
        }),
        [customers, filters.countryFilter, filters.languageFilter]
    );

    return { filters, isPending, error, customers: filteredCustomers };
}
