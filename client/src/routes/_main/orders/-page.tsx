import { useTranslation } from "react-i18next";
import OrderList from "./-components/order-list";
import OrderModal from "./-components/order-select-modal";
import useOrderFilters from "./-hooks/use-order-filters";
import { Breadcrumbs, Button, SearchBar, SortDropdown } from "@/components";
import { useModal } from "@/hooks";

export function OrderPage() {
    const { t } = useTranslation();

    const modal = useModal();
    const filters = useOrderFilters();

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: t("section.orders"), to: "/orders" },
                    ]}
                />
            </div>

            <div className="flex items-center gap-2">
                <SortDropdown value={filters.sort} onChange={filters.setSort} options={filters.sortOptions} />
                <SearchBar value={filters.searchQuery} onChange={filters.setSearchQuery} placeholder="Orders durchsuchen..." />

                <Button size="sm" onClick={() => modal.open()}>
                    {t("orders.create")}
                </Button>
            </div>

            <OrderList filters={filters} />

            {modal.isOpen && (
                <OrderModal key={modal.key} onClose={modal.close} />
            )}
        </div>
    );
}
