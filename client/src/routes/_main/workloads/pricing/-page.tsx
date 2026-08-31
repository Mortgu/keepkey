import { t } from "i18next";
import { LoaderCircle, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useEffect, useMemo } from "react";
import PricingTable from "./-components/pricing-table";
import StandardDurations from "./-components/standard-durations";
import TariffGroupModal from "./-components/tariff-group-modal";
import { useModal, useProducts, useTariffGroups } from "@/hooks";
import { useCreateTariffGroup } from "@/hooks/tariffs/tariff-mutations";
import { Button, PageWidth } from "@/components";

export default function PricingPage() {
    const { groups, isPending, error } = useTariffGroups();
    const { createTariffGroup, isPending: creatingGroup } = useCreateTariffGroup();
    const { products } = useProducts();
    const modal = useModal();

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);

    const assignedProductIds = useMemo(
        () => new Set(groups.flatMap(g => g.products.map(p => p.productId))),
        [groups],
    );

    if (isPending) {
        return (
            <LoaderCircle className="size-4" />
        )
    }

    return (
        <PageWidth variant="none">

            {/* Page header */}
            <div className="grid gap-4 px-8 py-6 border-b border-(--border)">
                <div className="flex items-center justify-between">
                    <div className="flex-1 grid gap-1">
                        <h1 className="font-medium text-xl">{t('section.workloads')}</h1>
                        <p className="font-light text-sm text-gray-400">
                            Zentrale Preistabellen Verwaltung
                        </p>
                    </div>
                    <div className="flex items-center gap-4">

                        <Button
                            icon={<Plus size={14} strokeWidth={3} />}
                            variant="primary"
                            size="sm"
                            onClick={() => modal.open()}
                        >
                            {t("customer.create")}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 px-8 py-6">
                <StandardDurations />

                {groups.map(group => (
                    <PricingTable key={group.id} group={group} />
                ))}
            </div>

            {modal.isOpen && (
                <TariffGroupModal
                    key={modal.key}
                    onClose={modal.close}
                    products={products}
                    excludeProductIds={assignedProductIds}
                    loading={creatingGroup}
                    submitFn={(value) => createTariffGroup({ products: value.products })}
                />
            )}
        </PageWidth>
    )
}
