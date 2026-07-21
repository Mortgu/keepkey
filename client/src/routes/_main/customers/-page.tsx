import { Button, PageWidth, SearchBar, SortDropdown } from "@/components";
import CustomerList from "./-components/customer-list";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useModal } from "@/hooks";
import { useTranslation } from "react-i18next";

const sortOptions = [
    { value: "createdAt:desc", label: "Datum – neuestes zuerst" },
    { value: "createdAt:asc", label: "Datum – ältestes zuerst" },
    { value: "orders:asc", label: "Orders - asc" },
    { value: "orders:desc", label: "Orders - Desc" },
];

export default function CustomerPage({ }) {
    const { t } = useTranslation();

    const [query, setQuery] = useState("");
    const [sort, setSort] = useState(sortOptions[0].value);

    const modal = useModal();

    return (
        <PageWidth variant="none">

            <div className="p-4 border-b border-(--border)">
                <h1 className="text-lg font-semibold">{t("section.customers")}</h1>
                <div className="flex items-center gap-1 text-sm font-light text-(--text-secondary)">
                    <a>dashboard</a>
                    <p>></p>
                    <a>customers</a>
                </div>
            </div>

            {/* Header */}
            <div className="flex items-center gap-4 border-b border-(--border) p-4">
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

            <CustomerList />
        </PageWidth>
    )
}