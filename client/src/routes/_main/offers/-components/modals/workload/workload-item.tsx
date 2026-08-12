import { LoaderCircle, Pen, Trash, X } from "lucide-react";
import { useState } from "react";
import {  coordinatesFrom } from "@keepit/schemas";
import { useOfferModalContext } from "../offer-modal-context";
import WorkloadForm from "./workload-form";
import type {CreateOfferPositionInput} from "@keepit/schemas";
import type { OfferModalPositionValues } from "@/routes/_main/offers/-schemas/offer-modal-schema";
import { Button } from "@/components";
import { useContract, useLocale, usePositionPrice, useProduct } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";

interface Props {
    workload: OfferModalPositionValues;
    updateFn: (workload: CreateOfferPositionInput) => void;
    /** Nicht gesetzt, wenn die Position nicht entfernt werden darf. */
    deleteFn?: () => void;
}

export default function WorkloadItem({ workload, updateFn, deleteFn }: Props) {
    const locale = useLocale();
    const { policy, sourceOffer, customerId } = useOfferModalContext();

    const [isEdit, setEdit] = useState<boolean>(false);

    const { product, isPending: productsPending } = useProduct(workload.productId);
    const { contract, isPending: contractPending } = useContract(workload.contractId);
    const { totalCents, unitCents, isLoading: pricePending } = usePositionPrice({
        source: policy.priceSource,
        coordinates: coordinatesFrom(customerId, workload),
        pin: sourceOffer
            ? { offerId: sourceOffer.id, positionId: workload.sourcePositionId ?? null }
            : undefined,
    });

    if (productsPending || contractPending || !product || !contract) {
        return (
            <div className="grid bg-(--subtle-50) border border-(--border) rounded-md">
                <div className="flex items-center justify-center px-4 py-3 gap-4">
                    <LoaderCircle size={14} className="animate-spin" />
                </div>
            </div>
        );
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
                            {!pricePending && <p className="text-sm font-semibold">{formatEur(totalCents)}</p>}
                        </div>

                        <div className="grid">
                            <p className="text-xs text-(--text-secondary)">Price per unit</p>
                            {pricePending && <LoaderCircle size={14} className="animate-spin" />}
                            {!pricePending && <p className="text-sm font-semibold">{formatEur(unitCents)}</p>}
                        </div>
                    </div>

                    {/* actions */}
                    <div className="flex items-center gap-2">

                        <Button variant="border" type="button" size="sm" disabled={isEdit} icon={
                            <Pen size={14} />
                        } iconOnly onClick={() => setEdit(true)} />

                        {deleteFn && (
                            <Button variant="border" type="button" size="sm" icon={
                                <Trash size={14} />
                            } iconOnly onClick={deleteFn} />
                        )}

                    </div>
                </div>


            </div>

            {isEdit && (
                <hr className="text-(--border)" />
            )}

            {isEdit && (
                <WorkloadForm
                    currentWorkload={workload}
                    cancelFn={() => setEdit(false)}
                    saveFn={(v) => updateFn(v)}
                />
            )}
        </div>
    )
}
