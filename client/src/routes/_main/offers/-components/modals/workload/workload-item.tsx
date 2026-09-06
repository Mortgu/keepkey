import { CircleAlert, LoaderCircle, Pen, Tag, Trash, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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
    /** Stelle im Positionsarray — adressiert die Preismeldung zu dieser Zeile. */
    index: number;
    workload: OfferModalPositionValues;
    updateFn: (workload: CreateOfferPositionInput) => void;
    /** Nicht gesetzt, wenn die Position nicht entfernt werden darf. */
    deleteFn?: () => void;
}

export default function WorkloadItem({ index, workload, updateFn, deleteFn }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();
    const { policy, sourceOffer, header, pricing } = useOfferModalContext();

    const priceError = pricing.errors[index] ?? null;

    const [isEdit, setEdit] = useState<boolean>(false);

    const { product, isPending: productsPending } = useProduct(workload.productId);
    // Vertrag und Laufzeit gehoeren dem Angebot, nicht der Position — angezeigt
    // werden sie hier trotzdem, weil die Zeile sonst nicht fuer sich steht.
    const { contract, isPending: contractPending } = useContract(header.contractId);
    const { totalCents, unitCents, isCustomerPrice, isLoading: pricePending } = usePositionPrice({
        source: policy.priceSource,
        coordinates: coordinatesFrom(header, workload),
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
        <div className={`grid bg-(--subtle-50) border rounded-md ${priceError ? "border-(--destructive-line)" : "border-(--border)"}`}>
            <div className="flex items-center justify-between px-4 py-3 gap-4">

                <div className="grid gap-0.5">
                    <p className="flex items-center gap-1 text-sm">
                        {workload.quantity} <X size={14} /> {localized(product.translations, locale, "name")}
                    </p>
                    <p className="text-sm text-(--text-secondary)">
                        {localized(contract.translations, locale, "name")} | {header.duration_months} Months
                    </p>
                </div>

                <div className="flex items-center gap-12">
                    {/* Ohne Preis werden keine Betraege gezeigt: 0,00 € saehe
                        aus wie ein Ergebnis, ist aber keins. */}
                    {priceError ? (
                        <p className="flex items-center gap-1.5 text-sm text-(--destructive)">
                            <CircleAlert size={14} />
                            {priceError}
                        </p>
                    ) : (
                        <div className="flex items-center gap-8">
                            <div className="grid">
                                <p className="text-xs text-(--text-secondary)">Total</p>
                                {pricePending && <LoaderCircle size={14} className="animate-spin" />}
                                {!pricePending && <p className="text-sm font-semibold">{formatEur(totalCents)}</p>}
                            </div>

                            <div className="grid">
                                {/* Ein Kundenpreis wird hier markiert, damit die
                                    Abweichung nicht erst beim Aufklappen auffaellt. */}
                                <p className="flex items-center gap-1 text-xs text-(--text-secondary)">
                                    Price per unit
                                    {!pricePending && isCustomerPrice && (
                                        <Tag size={10} aria-label={t("offerModal.customer_price")} />
                                    )}
                                </p>
                                {pricePending && <LoaderCircle size={14} className="animate-spin" />}
                                {!pricePending && (
                                    <p className={`text-sm font-semibold ${isCustomerPrice ? "text-(--info)" : ""}`}
                                        title={isCustomerPrice ? t("offerModal.customer_price") : undefined}>
                                        {formatEur(unitCents)}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

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
