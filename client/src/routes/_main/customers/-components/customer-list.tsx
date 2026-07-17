import { useTranslation } from "react-i18next";
import CustomerListItem from "./customer-list-item";
import CustomerModal from "./customer-modal";

import { Button, ListSkeleton, PageWidth, RouteError, SearchBar, Skeleton, SortDropdown } from "@/components";
import { useCustomers, useModal } from "@/hooks";
import { Plus } from "lucide-react";
import { Fragment, useState } from "react";

const sortOptions = [
    { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
    { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
    { value: "orders:asc", label: "Orders - asc" },
    { value: "orders:desc", label: "Orders - Desc" },
];


export default function CustomerList() {
    const { t } = useTranslation();

    const modal = useModal();
    const { customers, isPending, error } = useCustomers();

    const [query, setQuery] = useState("");
    const [sort, setSort] = useState(sortOptions[0].value);

    return (
        <PageWidth variant="none">
            {/* Header */}
            <div className="flex  items-center gap-4 border-b border-(--border) p-4">
                <SortDropdown
                    value={sort}
                    onChange={setSort}
                    options={sortOptions}
                />
                <SearchBar value={query} onChange={setQuery} placeholder="Search Customer, Contact Person, Phone, E-Mail..." />
                <Button size="sm" icon={
                    <Plus size={14} />
                } onClick={() => modal.open()}>{t("button.create")}</Button>
            </div>

            {/* Filter */}
            <div className="flex  items-center gap-4">

            </div>

            <PageWidth variant="full">

                {isPending && (
                    <ListSkeleton
                        rows={6}
                        skeleton={<Skeleton shape="rect" />}
                    />
                )}

                {error && (
                    <RouteError error={error} />
                )}

                {(customers.length === 0) && (
                    <p className="text-sm text-(--text-secondary) py-8 text-center">

                    </p>
                )}


                <div className="grid gap-2">
                    {customers.map((item, index) => (
                        <Fragment key={item.id}>
                            <CustomerListItem customer={item} />
                        </Fragment>
                    ))}
                </div>

                {modal.isOpen && (
                    <CustomerModal key={modal.key} onClose={modal.close} />
                )}

            </PageWidth>
        </PageWidth>
    );
}
