import { Pen, Plus, Trash } from "lucide-react";
import { useEffect, useMemo } from "react";
import PricingTableItem from "./pricing-table-item";
import AddContractsModal from "./add-contracts-modal";
import EditProductsModal from "./edit-products-modal";
import type { TariffGroup } from "@keepit/schemas";
import { Button, showToast } from "@/components";
import { useContracts, useCreateTariff, useDeleteTariffGroup, useLocale, useModal, useProducts, useUpdateTariffGroup } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatDate } from "@/lib/format";
import { getErrorMessage } from "@/lib/errors";

type Props = {
    group: TariffGroup;
}

export default function PricingTable({ group }: Props) {
    const locale = useLocale();

    const { deleteTariffGroup, isPending: deleteTariffGroupPending, error: deleteTariffGroupError } = useDeleteTariffGroup();
    const { createTariff, isPending: createTariffPending, error: createTariffError } = useCreateTariff();
    const { updateTariffGroup, isPending: updateTariffGroupPending, error: updateTariffGroupError } = useUpdateTariffGroup();
    const { products } = useProducts();
    const { contracts } = useContracts();
    const modal = useModal();
    const editModal = useModal();

    useEffect(() => {
        if (deleteTariffGroupError) {
            showToast.error("common.errorGeneric", { message: getErrorMessage(deleteTariffGroupError) });
        }
    }, [deleteTariffGroupError]);

    useEffect(() => {
        if (createTariffError) {
            showToast.error("common.errorGeneric", { message: getErrorMessage(createTariffError) });
        }
    }, [createTariffError]);

    useEffect(() => {
        if (updateTariffGroupError) {
            showToast.error("common.errorGeneric", { message: getErrorMessage(updateTariffGroupError) });
        }
    }, [updateTariffGroupError]);

    const excludeContractIds = useMemo(
        () => new Set(group.tariffs.map(t => t.contractId)),
        [group.tariffs],
    );

    const handleAddContracts = async (contractIds: Array<string>) => {
        for (const contractId of contractIds) {
            await createTariff({ groupId: group.id, input: { contractId } });
        }
    };

    const handleUpdateProducts = (productIds: Array<string>) => {
        updateTariffGroup({ id: group.id, input: { products: productIds } });
    };

    return (
        <div className="border border-(--border) rounded-md overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-(--border) bg-(--page-bg)">
                <div>
                    <p className="text-md font-normal flex gap-1">
                        {group.products.map((gp, idx) => (
                            <span key={gp.productId}>
                                {idx > 0 && ", "}
                                <span className="hover:underline cursor-pointer">
                                    {localized(gp.product.translations, locale, "name")}
                                </span>
                            </span>
                        ))}
                    </p>
                    <p className="text-sm text-(--text-secondary)">{formatDate(group.createdAt)}</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="border"
                        icon={<Plus className="size-3.5" />}
                        iconOnly
                        onClick={() => modal.open()}
                    />

                    <Button
                        size="sm"
                        variant="border"
                        icon={<Pen className="size-3.5" />}
                        iconOnly
                        onClick={() => editModal.open()}
                        loading={updateTariffGroupPending}
                        disabled={updateTariffGroupPending}
                    />

                    <Button
                        size="sm"
                        variant="border"
                        icon={<Trash className="size-3.5" />}
                        iconOnly
                        onClick={() => deleteTariffGroup({ id: group.id })}
                        loading={deleteTariffGroupPending}
                        disabled={deleteTariffGroupPending}
                    />
                </div>
            </div>

            <div className="grid">
                {group.tariffs.map(tariff => (
                    <PricingTableItem key={tariff.id} tariff={tariff} />
                ))}
            </div>

            {modal.isOpen && (
                <AddContractsModal
                    key={modal.key}
                    onClose={modal.close}
                    contracts={contracts}
                    excludeContractIds={excludeContractIds}
                    loading={createTariffPending}
                    submitFn={handleAddContracts}
                />
            )}

            {editModal.isOpen && (
                <EditProductsModal
                    key={editModal.key}
                    onClose={editModal.close}
                    products={products}
                    selectedProductIds={group.products.map(gp => gp.productId)}
                    loading={updateTariffGroupPending}
                    submitFn={handleUpdateProducts}
                />
            )}
        </div>
    );
}
