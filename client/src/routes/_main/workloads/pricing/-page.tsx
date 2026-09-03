import { t } from "i18next";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useEffect, useMemo } from "react";
import PricingTable from "./-components/pricing-table";
import StandardDurations from "./-components/standard-durations";
import StandardTiers from "./-components/standard-tiers";
import TariffGroupModal from "./-components/tariff-group-modal";
import { useModal, useProducts, useTariffGroups } from "@/hooks";
import { useCreateTariffGroup } from "@/hooks/tariffs/tariff-mutations";
import { Breadcrumbs, Button } from "@/components";

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
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: "Workloads", to: "/workloads" },
                        { label: "Pricing", to: "/workloads/pricing" },
                    ]}
                />

                <Button size="sm" onClick={() => modal.open()}>
                    {t("workloads.pricing.create")}
                </Button>

            </div>

            <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <StandardDurations />
                    <StandardTiers />
                </div>

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
        </div>
    )
}
