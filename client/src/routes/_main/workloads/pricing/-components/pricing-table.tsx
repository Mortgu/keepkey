import { Pen, Plus, Trash } from "lucide-react";
import { useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import PricingTableItem from "./pricing-table-item";
import AddContractsModal from "./add-contracts-modal";
import type { TariffGroup } from "@/types";
import { Button } from "@/components";
import { useContracts, useLocale, useModal } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatDate } from "@/lib/format";
import { useCreateTariff, useDeleteTariffGroup } from "@/hooks/tariffs/tariff-mutations";

type Props = {
    group: TariffGroup;
}

export default function PricingTable({ group }: Props) {
    const locale = useLocale();

    const { deleteTariffGroup, deleteTariffGroupPending, deleteTariffGroupError } = useDeleteTariffGroup();
    const { createTariff, createTariffPending, createTariffError } = useCreateTariff();
    const { contracts } = useContracts();
    const modal = useModal();

    useEffect(() => {
        if (deleteTariffGroupError) {
            toast.error(deleteTariffGroupError.message);
        }
    }, [deleteTariffGroupError]);

    useEffect(() => {
        if (createTariffError) {
            toast.error(createTariffError.message);
        }
    }, [createTariffError]);

    const excludeContractIds = useMemo(
        () => new Set(group.tariffs.map(t => t.contractId)),
        [group.tariffs],
    );

    const handleAddContracts = async (contractIds: Array<string>) => {
        for (const contractId of contractIds) {
            await createTariff({ groupId: group.id, input: { contractId } });
        }
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
                    <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />} iconOnly
                        onClick={() => modal.open()} />
                    <Button size="sm" variant="secondary" icon={<Pen className="size-3.5" />} iconOnly />
                    <Button size="sm" variant="secondary" icon={<Trash className="size-3.5" />} iconOnly
                        onClick={() => deleteTariffGroup({ id: group.id })} loading={deleteTariffGroupPending} disabled={deleteTariffGroupPending} />
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
        </div>
    );
}
