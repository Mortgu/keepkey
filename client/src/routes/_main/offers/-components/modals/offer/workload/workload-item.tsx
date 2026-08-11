import { LoaderCircle, Pen, Trash, X } from "lucide-react";
import { useState } from "react";
import WorkloadFormOfferModal from "./workload-form";
import type { CreateOfferPositionInput } from "@keepit/schemas";
import { Button } from "@/components";
import { useContract, useLocale, usePositionPrice, useProduct } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";

interface Props {
    offerId: string;
    customerId: string;
    workload: CreateOfferPositionInput;

    updateFn: (workload: CreateOfferPositionInput) => void;
    deleteFn: () => void;
}

export default function WorkloadItemOfferModal({ offerId, customerId, workload, updateFn, deleteFn }: Props) {
    const locale = useLocale();

    const [isEdit, setEdit] = useState<boolean>(false);

    const { product, isPending: productsPending } = useProduct(workload.productId);
    const { contract, isPending: contractPending } = useContract(workload.contractId);
    const { isPending, error, result } = usePositionPrice({
        source: "live",
        query: {
            customerId,
            productId: workload.productId,
            contractId: workload.contractId,
            duration: workload.duration,
            quantity: workload.quantity,
            free_months: workload.free_months,
        },
    });

    if (!product || !contract) {
        return (
            <div>dw</div>
        )
    }

    if (productsPending || contractPending || isPending) {
        <div className="grid bg-(--subtle-50) border border-(--border) rounded-md">
            <div className="flex items-center justify-center px-4 py-3 gap-4">
                <LoaderCircle size={14} />
            </div>
        </div>
    }

    return (
        <div className="grid bg-(--subtle-50) border border-(--border) rounded-md">
            <div className="flex items-center justify-between px-4 py-3 gap-4">

                <div className="grid gap-0.5">
                    <p className="flex items-center gap-1 text-sm">
                        {workload.quantity} <X size={14} /> {localized(product.translations, locale, "name")}
                    </p>
                    <p className="text-sm text-(--text-secondary)">
                        {localized(contract.translations, locale, "name")} | {workload.duration} Months
                    </p>
                </div>

                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-8">
                        <div className="grid">
                            <p className="text-xs text-(--text-secondary)">Total</p>
                            {isPending && <LoaderCircle size={14} className="animate-spin" />}
                            {!isPending && <p className="text-sm font-semibold">{formatEur(result?.total ?? 0)}</p>}
                        </div>

                        <div className="grid">
                            <p className="text-xs text-(--text-secondary)">Price per unit</p>
                            {isPending && <LoaderCircle size={14} className="animate-spin" />}
                            {!isPending && <p className="text-sm font-semibold">{formatEur(result?.unit ?? 0)}</p>}
                        </div>
                    </div>

                    {/* actions */}
                    <div className="flex items-center gap-2">

                        <Button variant="border" type="button" size="sm" icon={
                            <Pen size={14} />
                        } iconOnly onClick={() => setEdit(true)} />

                        <Button variant="border" type="button" size="sm" icon={
                            <Trash size={14} />
                        } iconOnly onClick={deleteFn} />

                    </div>
                </div>


            </div>

            {isEdit && (
                <hr className="text-(--border)" />
            )}

            {isEdit && (
                <WorkloadFormOfferModal
                    customerId={customerId}
                    currentWorkload={workload}
                    cancelFn={() => setEdit(false)}
                    saveFn={(v) => updateFn(v)}
                />
            )}
        </div>
    )
}