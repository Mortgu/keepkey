import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import OrderList from "./-components/order-list";
import OrderModal from "./-components/order-select-modal";
import OrderFilters from "./-components/order-filters";
import useOrderFilters from "./-hooks/use-order-filters";
import { useModal } from "@/hooks";
import { Button, PageWidth } from "@/components";

export function OrderPage() {
    const { t } = useTranslation();

    const modal = useModal();
    const filters = useOrderFilters();

    return (
        <PageWidth variant="none">
            <div className="bg-white border-b border-(--border) px-8 py-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex-1 grid gap-1">
                        <h1 className="font-medium text-xl">{t("section.orders")}</h1>
                        <h1 className="font-light text-sm text-gray-400">{t("orders.description")}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            icon={<Plus size={14} strokeWidth={3} />}
                            variant="primary"
                            size="sm"
                            onClick={() => modal.open()}>
                            {t("button.create")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="px-8 py-4 border-b border-(--border)">
                <OrderFilters filters={filters} />
            </div>

            <div className="px-8 py-6">
                <OrderList filters={filters} />
            </div>

            {modal.isOpen && (
                <OrderModal key={modal.key} onClose={modal.close} />
            )}
        </PageWidth>
    );
}
