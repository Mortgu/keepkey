import { Download, Plus } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import useCustomerFilters from "./-hooks/use-customer-filters";
import CustomerModal from "./-components/customer-modal";
import CustomerTable from "./-components/customer-table";
import type { Customer } from "@keepit/schemas";
import { Button, FilterChip, MultiDropdown, PageWidth, RouteError, SearchBar, Skeleton } from "@/components";
import { useCustomers } from "@/hooks/customers/customer-hooks";
import { useModal } from "@/hooks";
import { COUNTRY_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/countries";

export default function CustomerPage() {
    const { t } = useTranslation();
    const modal = useModal<Customer>();

    const filters = useCustomerFilters();
    const { customers, isPending, error } = useCustomers(filters.params);

    const filteredCustomers = useMemo(
        () =>
            customers.filter((c) => {
                if (filters.countryFilter.length > 0 && !filters.countryFilter.includes(c.country)) {
                    return false;
                }
                if (filters.languageFilter.length > 0 && !filters.languageFilter.includes(c.language)) {
                    return false;
                }
                return true;
            }),
        [customers, filters.countryFilter, filters.languageFilter],
    );

    return (
        <PageWidth variant="none">
            <div className="grid grid-rows-[auto_1fr] h-full">
                <div className="h-fit">
                    {/* Header */}
                    <div className="grid gap-4 px-8 py-6 border-b border-(--border)">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 grid gap-1">
                                <h1 className="font-medium text-xl">Kunden</h1>
                                <p className="font-light text-sm text-gray-400">
                                    Zentrale Kundenakte — Vorgänge anlegen, Stammdaten pflegen, Verlängerungen im Blick behalten.
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button icon={<Download size={14} />} variant="border" size="sm">
                                    Export
                                </Button>
                                <Button
                                    icon={<Plus size={14} strokeWidth={3} />}
                                    variant="primary"
                                    size="sm"
                                    onClick={() => modal.open()}
                                >
                                    Kunde anlegen
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Filterleiste */}
                    <div className="flex items-center justify-between gap-4 border-b border-(--border) p-4 px-8">
                        <div className="flex items-center gap-2 flex-1">
                            {/*<SortDropdown
                                value={filters.sort}
                                onChange={filters.setSort}
                                options={filters.sortOptions}
                            />*/}

                            <SearchBar
                                className="flex-1"
                                value={filters.searchInput}
                                onChange={filters.setSearchInput}
                                onSubmit={() => { }}
                                placeholder={t("common.search")}
                            />

                            <MultiDropdown
                                label="Land"
                                options={COUNTRY_OPTIONS}
                                values={filters.countryFilter}
                                onChange={filters.setCountryFilter}
                            />

                            <MultiDropdown
                                label="Sprache"
                                options={LANGUAGE_OPTIONS}
                                values={filters.languageFilter}
                                onChange={filters.setLanguageFilter}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-100 h-full px-8 py-4">
                    {filters.activeFilterCount > 0 && (
                        <div className="flex gap-2 w-fit flex-wrap mb-4">
                            {filters.countryFilter.map((val) => {
                                const option = COUNTRY_OPTIONS.find((o) => o.value === val);
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
                                const option = LANGUAGE_OPTIONS.find((o) => o.value === val);
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

                    {error ? (
                        <RouteError error={error} />
                    ) : isPending ? (
                        <div className="bg-white border border-(--border) rounded-md overflow-hidden">
                            <div className="flex items-center gap-6 px-4 py-2.5 border-b border-(--border) bg-(--subtle-50)">
                                <Skeleton className="h-3.5 w-24" />
                                <Skeleton className="h-3.5 w-32" />
                                <Skeleton className="h-3.5 w-20" />
                                <Skeleton className="h-3.5 w-20" />
                            </div>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-6 px-4 py-3.5 border-b border-(--border) last:border-b-0">
                                    <div className="flex items-center gap-2.5 flex-1">
                                        <Skeleton shape="circle" className="size-[30px] shrink-0" />
                                        <div className="flex flex-col gap-1">
                                            <Skeleton className="h-3.5 w-32" />
                                            <Skeleton className="h-3 w-40" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-3.5 w-24" />
                                    <Skeleton className="h-3.5 w-12" />
                                    <Skeleton className="h-3.5 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <CustomerTable customers={filteredCustomers} onEdit={(customer) => modal.open(customer)} />
                    )}
                </div>
            </div>

            {modal.isOpen && (
                <CustomerModal
                    key={modal.key}
                    onClose={modal.close}
                    currentCustomer={modal.data}
                />
            )}
        </PageWidth>
    );
}
