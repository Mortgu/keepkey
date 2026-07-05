import { SortDropdown, MultiDropdown, SearchBar, Button, FilterChip } from "@/components";
import { useCustomers, useModal } from "@/hooks";
import type { Customer } from "@/types";
import { Plus } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

const sort_options = [
    { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
    { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
];

export default function InvoiceList() {
    const modal = useModal();

    const [searchInput, setSearchInput] = useState("");
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
        setSearchInput(searchInput);
    };

    return (
        <Fragment>
            {/* Header */}
            <div className='flex justify-between items-center gap-4'>
                <div className="w-full flex items-center gap-2">
                    <SortDropdown value={sort} onChange={setSort} options={sort_options} />

                    <MultiDropdown label="Kunde" options={customerFilterOptions}
                        values={customerFilter} onChange={setCustomerFilter} />

                    <SearchBar value={searchInput} onChange={setSearchInput}
                        onSubmit={handleSearch} placeholder="AG-Nr. Suchen..." />
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => modal.open()} size='sm'>Create <Plus className='size-4' /></Button>
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
        </Fragment>
    )
}