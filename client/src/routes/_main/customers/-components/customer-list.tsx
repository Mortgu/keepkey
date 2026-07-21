import { Plus } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import useCustomerFilters from "../-hooks/use-customer-filters";
import CustomerListItem from "./customer-list-item";
import CustomerModal from "./customer-modal";

import { Button, FilterChip, PageWidth, RouteError, SearchBar } from "@/components";
import { MultiDropdown } from "@/components/filters/multi-dropdown";
import { SortDropdown } from "@/components/filters/sort-dropdown";
import { useCustomers, useModal } from "@/hooks";
import type { Customer } from "@/types";

const countryFilterOptions = [
    { value: "Deutschland", label: "Deutschland" },
    { value: "Schweiz", label: "Schweiz" },
    { value: "Südafrika", label: "Südafrika" },
];

const languageFilterOptions = [
    { value: "DE", label: "Deutsch" },
    { value: "EN", label: "English" },
];

export default function CustomerList() {
    const { t } = useTranslation();
    const modal = useModal<Customer>();

    const filters = useCustomerFilters();
    const { customers, isPending, error } = useCustomers(filters.params);

    const filteredCustomers = useMemo(() => {
        return customers.filter((c) => {
            if (filters.countryFilter.length > 0 && !filters.countryFilter.includes(c.country)) {
                return false;
            }
            if (filters.languageFilter.length > 0 && !filters.languageFilter.includes(c.language)) {
                return false;
            }
            return true;
        });
    }, [customers, filters.countryFilter, filters.languageFilter]);

    return (
        <PageWidth variant="none">
            <div className="flex justify-between items-center gap-4 p-4 border-b border-(--border)">
                <SortDropdown
                    value={filters.sort}
                    onChange={filters.setSort}
                    options={filters.sortOptions}
                />

                <MultiDropdown
                    label="Land"
                    options={countryFilterOptions}
                    values={filters.countryFilter}
                    onChange={filters.setCountryFilter}
                />

                <MultiDropdown
                    label="Sprache"
                    options={languageFilterOptions}
                    values={filters.languageFilter}
                    onChange={filters.setLanguageFilter}
                />

                <SearchBar
                    value={filters.searchInput}
                    onChange={filters.setSearchInput}
                    onSubmit={() => { }}
                    placeholder={t("common.search")}
                />

                <Button size="sm" onClick={() => modal.open()}>
                    {t("button.create")} <Plus className="size-3.5 ml-1" />
                </Button>
            </div>

            <PageWidth variant="full">
                <div className="grid gap-4">
                    {filters.activeFilterCount > 0 && (
                        <div className="flex gap-2 w-fit flex-wrap">
                            {filters.countryFilter.map((val) => {
                                const option = countryFilterOptions.find((o) => o.value === val);
                                if (!option) return null;
                                return (
                                    <FilterChip
                                        key={`country-${val}`}
                                        label="Land"
                                        value={option.label}
                                        onRemove={() => filters.removeCountryFilter(val)}
                                    />
                                );
                            })}
                            {filters.languageFilter.map((val) => {
                                const option = languageFilterOptions.find((o) => o.value === val);
                                if (!option) return null;
                                return (
                                    <FilterChip
                                        key={`language-${val}`}
                                        label="Sprache"
                                        value={option.label}
                                        onRemove={() => filters.removeLanguageFilter(val)}
                                    />
                                );
                            })}
                        </div>
                    )}


                    {error && <RouteError error={error} />}

                    {!error && !isPending && filteredCustomers.length === 0 && (
                        <p className="text-sm text-(--text-secondary) py-8 text-center">
                            {filters.searchInput || filters.activeFilterCount > 0
                                ? t("common.noResults")
                                : null}
                        </p>
                    )}

                    {!error && !isPending && filteredCustomers.map((customer) => (
                        <CustomerListItem key={customer.id} customer={customer} />
                    ))}
                </div>

                {modal.isOpen && (
                    <CustomerModal key={modal.key} onClose={modal.close} />
                )}
            </PageWidth>
        </PageWidth>
    );
}
