import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import InvoiceCard from "./invoice-card";
import type { Customer } from "@keepit/schemas";
import { useCustomers, useInvoices } from "@/hooks";
import { FilterChip, ListSkeleton, MultiDropdown, RouteError, SearchBar, Skeleton, SortDropdown } from "@/components";

const sort_options = [
    { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
    { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
];

export default function InvoiceList() {
    const { t } = useTranslation();

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState(sort_options[0].value);
    const [customerFilter, setCustomerFilter] = useState<Array<string>>([]);
    const [contactPersonFilter] = useState<Array<string>>([]);

    const { customers } = useCustomers();

    const customerFilterOptions = useMemo(() =>
        customers.map((c: Customer) => ({
            value: c.id,
            label: c.companyName,
        })),
        [customers]);

    const activeFilterCount = customerFilter.length + contactPersonFilter.length;

    const handleSearch = () => {
        setSearch(searchInput.trim());
    };

    const { invoices, isPending, error } = useInvoices({
        search: search || undefined,
        customerIds: customerFilter.length ? customerFilter : undefined,
    });
    const sorted = useMemo(() => {
        const list = [...invoices];
        list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        return sort === "createdAt:desc" ? list.reverse() : list;
    }, [invoices, sort]);

    return (
        <Fragment>
            {/* Header */}
            <div className='flex justify-between items-center gap-4'>
                <div className="w-full flex items-center gap-2">
                    <SortDropdown value={sort} onChange={setSort} options={sort_options} />

                    <MultiDropdown label="Kunde" options={customerFilterOptions}
                        values={customerFilter} onChange={setCustomerFilter} />

                    <SearchBar value={searchInput} onChange={setSearchInput}
                        onSubmit={handleSearch} placeholder={t("invoices.searchPlaceholder")} />
                </div>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex gap-2 w-fit flex-wrap">
                    {customerFilter.map((id) => {
                        const option = customerFilterOptions.find(i => i.value === id);
                        if (!option) return null;
                        return (
                            <FilterChip key={`customer-${id}`} label="Kunde" value={option.label}
                                onRemove={() => setCustomerFilter(customerFilter.filter(i => i !== id))} />
                        );
                    })}
                </div>
            )}

            {/* Rechnungen entstehen an der Bestellung — hier wird nur gelistet. */}
            {isPending && <ListSkeleton rows={4} skeleton={<Skeleton className="h-24" />} />}
            {error && <RouteError error={error} />}
            {!isPending && !error && (
                <div className="grid gap-3">
                    {sorted.map((invoice) => <InvoiceCard key={invoice.id} invoice={invoice} />)}
                    {sorted.length === 0 && (
                        <p className="text-sm text-(--text-secondary) text-center py-8">{t("invoices.empty")}</p>
                    )}
                </div>
            )}
        </Fragment>
    )
}