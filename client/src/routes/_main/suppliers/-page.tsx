import { useTranslation } from "react-i18next";
import SupplierModal from "./-components/supplier-modal";
import useSupplierFilters from "./-hooks/use-supplier-filters";
import type { Supplier } from "@keepit/schemas";
import { Breadcrumbs, Button, RouteError, SearchBar, SortDropdown } from "@/components";
import { useModal, useSuppliers } from "@/hooks";
import SupplierListItem from "./-components/supplier-list-item";
import { LoaderCircle } from "lucide-react";
import { error } from "better-auth/api";

export default function SupplierPage() {
    const { t } = useTranslation();
    const modal = useModal<Supplier>();

    const filters = useSupplierFilters();

    const {
        suppliers,
        isPending: pendingSuppliers,
        error: errorSuppliers
    } = useSuppliers();

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: t("section.suppliers"), to: "/suppliers" },
                    ]}
                />
            </div>

            <div className="flex items-center gap-2">
                <SortDropdown value={filters.sort} onChange={filters.setSort} options={filters.sortOptions} />
                <SearchBar value={filters.searchQuery} onChange={filters.setSearchQuery} placeholder={t("suppliers.searchPlaceholder")} />

                <Button size="sm" onClick={() => modal.open()}>
                    {t("suppliers.create")}
                </Button>
            </div>

            <div className="grid gap-4">
                {errorSuppliers && (
                    <RouteError error={error} />
                )}

                {pendingSuppliers && (
                    <div className="py-8 flex items-center justify-center">
                        <LoaderCircle className="animate-spin" />
                    </div>
                )}

                {suppliers.map(supplier => (
                    <SupplierListItem
                        key={supplier.id}
                        supplier={supplier}
                        onEdit={(supplier) => modal.open(supplier)}
                    />
                ))}
            </div>

            {modal.isOpen && (
                <SupplierModal
                    key={modal.key}
                    onClose={modal.close}
                    currentSupplier={modal.data}
                />
            )}
        </div>
    )
}
