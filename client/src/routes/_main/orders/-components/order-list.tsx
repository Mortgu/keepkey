import {Plus} from "lucide-react";
import {useMemo, useState} from "react";
import OrderModal from "./order-modal";
import {useCustomerHook, useModal, useOrderHook} from "@/hooks";
import type {Customer, Order} from "@/types";

import OrderCard from "./order-card";
import {Button, FilterChip, SearchBar} from "@/components";
import {MultiDropdown} from "@/components/filters/multi-dropdown";
import {SortDropdown} from "@/components/filters/sort-dropdown";

const sort_options = [
    {value: "createdAt:desc", label: "Datum – neuestes zuerst"},
    {value: "createdAt:asc", label: "Datum – ältestes zuerst"},
];

export default function OrderList() {
    const modal = useModal();
    const [searchInput, setSearchInput] = useState("");
    const [sort, setSort] = useState(sort_options[0].value);
    const [customerFilter, setCustomerFilter] = useState<string[]>([]);
    const [contactPersonFilter] = useState<string[]>([]);

    const {orders} = useOrderHook();
    const {customers} = useCustomerHook();

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
        <>
            <div className='flex justify-between items-center gap-4'>
                <div className="w-full flex items-center gap-2">
                    <SortDropdown value={sort} onChange={setSort} options={sort_options}/>

                    <MultiDropdown label="Kunde" options={customerFilterOptions}
                                   values={customerFilter} onChange={setCustomerFilter}/>

                    <SearchBar value={searchInput} onChange={setSearchInput}
                               onSubmit={handleSearch} placeholder="AG-Nr. Suchen..."/>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => modal.open()} size='sm'>Create <Plus className='size-4'/></Button>
                </div>
            </div>

            {activeFilterCount > 0 && (
                <div className="flex gap-2 w-fit flex-wrap">
                    {customerFilter.map((id) => {
                        const option = customerFilterOptions.find(i => i.value === id);
                        if (!option) return null;
                        return (
                            <FilterChip key={`customer-${id}`} label="Kunde" value={option.label}
                                        onRemove={() => setCustomerFilter(customerFilter.filter(i => i !== id))}/>
                        );
                    })}
                </div>
            )}

            <div className='grid gap-2'>
                {orders.map((order: Order) => (
                    <OrderCard key={order.id} order={order}/>
                ))}
            </div>

            {modal.isOpen && (
                <OrderModal key={modal.key} onClose={modal.close}/>
            )}
        </>
    )
}
