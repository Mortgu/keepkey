import { Button } from "@/components";
import { useContract, useLocale, usePrice, useProduct } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";
import { LoaderCircle, Pen, Trash, X } from "lucide-react";
import { useState } from "react";
import type { OfferProductInput } from "../modal-components/offer-product-form";
import WorkloadFormOfferModal from "./workload-form";

interface Props {
    customerId: string;
    workload: OfferProductInput;

    updateFn: (workload: OfferProductInput) => void;
    deleteFn: () => void;
}

export default function WorkloadItemOfferModal({ customerId, workload, updateFn, deleteFn }: Props) {
    const locale = useLocale();

    const [isEdit, setEdit] = useState<boolean>(false);

    const { product, isPending: productsPending } = useProduct(workload.productId);
    const { contract, isPending: contractPending } = useContract(workload.contractId);
    const { price, isPending: pricePending } = usePrice(customerId, workload);

    if (!product || !contract) {
        return (
            <div>dw</div>
        )
    }

    if (productsPending || contractPending || pricePending) {
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
                        {localized(contract.translations, locale, "name")} | {workload.duration_months} Months
                    </p>
                </div>

                <div className="flex items-center gap-12">
                    <div className="flex items-center gap-8">
                        <div className="grid">
                            <p className="text-xs text-(--text-secondary)">Total</p>
                            {pricePending && <LoaderCircle size={14} className="animate-spin" />}
                            {!pricePending && <p className="text-sm font-semibold">{formatEur(price?.price || 0)}</p>}
                        </div>

                        <div className="grid">
                            <p className="text-xs text-(--text-secondary)">Price per unit</p>
                            {pricePending && <LoaderCircle size={14} className="animate-spin" />}
                            {!pricePending && <p className="text-sm font-semibold">{formatEur(price?.breakdown.unitPrice || 0)}</p>}
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
                    currentWorkload={workload}
                    cancelFn={() => setEdit(false)}
                    saveFn={(v) => updateFn(v)}
                />
            )}
        </div>
    )
}