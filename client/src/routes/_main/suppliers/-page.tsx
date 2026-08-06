import { Button, PageWidth } from "@/components";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import SupplierList from "./-components/supplier-list";
import useSupplierFilters from "./-hooks/use-supplier-filters";
import SupplierFilters from "./-components/supplier-filters";
import { useModal } from "@/hooks";
import type { Supplier } from "@keepit/schemas";
import SupplierModal from "./-components/supplier-modal";

export default function SupplierPage() {
    const { t } = useTranslation();
    const modal = useModal<Supplier>();

    const filters = useSupplierFilters();

    return (
        <PageWidth variant="none">
            <div className="bg-white border-b border-(--border) px-8 py-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex-1 grid gap-1">
                        <h1 className="font-medium text-xl">{t("section.suppliers")}</h1>
                        <h1 className="font-light text-sm text-gray-400">Zentrale verwaltung der Lieferanten</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button icon={<Plus size={14} strokeWidth={3} />} variant="primary" size="sm"
                            onClick={() => modal.open()}>{t("button.create")}</Button>
                    </div>
                </div>

            </div>

            <div className="px-8 py-4 border-b border-(--border)">
                <SupplierFilters filters={filters} />
            </div>

            <div className="px-8 py-6">
                <SupplierList
                    filters={filters}
                    onEdit={(supplier) => modal.open(supplier)}
                />
            </div>

            {modal.isOpen && (
                <SupplierModal
                    key={modal.key}
                    onClose={modal.close}
                    currentSupplier={modal.data}
                />
            )}
        </PageWidth>
    )
}