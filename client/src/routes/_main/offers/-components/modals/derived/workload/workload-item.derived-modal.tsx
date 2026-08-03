import { useStore } from "@tanstack/react-form";
import { LoaderCircle, MoveRight, Pen, Trash, TriangleAlert } from "lucide-react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import useDerivedPositionPrice from "../hook/use-derived-position-price";
import WorkloadItemFormDerivedModal from "./workload-item-form.derived-modal";
import type { OfferPosition } from "@keepit/schemas";
import type { DerivedFormApi, DerivedMode } from "../hook/use-derived-form";
import { Button } from "@/components";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";

interface Props {
    form: DerivedFormApi;
    mode: DerivedMode;
    offerId: string;
    index: number;
    customerId: string;
    originalPosition: OfferPosition;
    /** Nicht gesetzt, wenn die Position nicht entfernt werden darf. */
    onRemove?: () => void;
}

export default function WorkloadItemDerivedModal({
    form, mode, offerId, index, customerId, originalPosition, onRemove,
}: Props) {
    const { t } = useTranslation();
    const locales = useLocale();
    const [edit, setEdit] = useState<boolean>(false);

    // useStore statt form.store.state: Nur so rendert die Zeile neu, wenn die
    // Menge im Unterformular geändert wird.
    const position = useStore(form.store, (s) => s.values.offerPositions[index]);

    const isExtension = mode === "extension";

    const { totalCents, isPending, fromSnapshot } = useDerivedPositionPrice({
        mode,
        offerId,
        customerId,
        sourcePositionId: originalPosition.id,
        position,
    });

    const originalTotal =
        (originalPosition.duration_months - originalPosition.free_months)
        * originalPosition.eur_user_month
        * originalPosition.quantity;

    const priceChanged = originalTotal !== totalCents;
    const quantityChanged = originalPosition.quantity !== position.quantity;
    const durationChanged = originalPosition.duration_months !== position.duration_months;

    return (
        <Fragment>
            <div className="border border-(--border) rounded-md overflow-hidden">
                <div className="flex items-center justify-between bg-(--subtle-50) px-4 py-3">
                    <div className="grid">
                        <p className="font-normal">{localized(originalPosition.product.translations, locales, "name")}</p>
                        <p className="font-normal text-sm text-gray-400">{localized(originalPosition.contract.translations, locales, "name")}</p>
                    </div>

                    <div className="relative divide-x divide-(--border) flex items-center">
                        <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                            <span className="text-xs text-gray-500">{t("renewal.duration")}</span>
                            <div className="flex items-center gap-2">
                                {durationChanged && (
                                    <>
                                        <span className="text-md font-mono font-normal line-through">{originalPosition.duration_months} Mo.</span>
                                        <MoveRight size={14} className="text-gray-500" />
                                    </>
                                )}
                                <span className="text-md font-mono font-normal">{position.duration_months} Mo.</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                            <span className="text-xs text-gray-500">{t("renewal.quantity")}</span>
                            <div className="flex items-center gap-2">
                                {quantityChanged && (
                                    <>
                                        <span className="text-md font-mono font-normal line-through">{originalPosition.quantity}</span>
                                        <MoveRight size={14} className="text-gray-500" />
                                    </>
                                )}
                                <span className="text-md font-mono font-normal">{position.quantity}</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                            <span className="text-xs text-gray-500">{t("renewal.total")}</span>
                            <div className="flex items-center gap-2">
                                {priceChanged && (
                                    <>
                                        <span className="text-md font-mono font-normal line-through">{formatEur(originalTotal)}</span>
                                        <MoveRight size={14} className="text-gray-500" />
                                    </>
                                )}
                                {isPending ? (
                                    <LoaderCircle size={14} className="animate-spin" />
                                ) : (
                                    <span className="text-md font-mono font-normal">{formatEur(totalCents)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isExtension && !fromSnapshot && (
                    <div className="flex items-center gap-2 border-t border-(--border) px-4 py-2 text-sm text-gray-500">
                        <TriangleAlert size={14} />
                        <span>{t("licenseExtension.no_snapshot")}</span>
                    </div>
                )}

                {edit && (
                    <WorkloadItemFormDerivedModal
                        form={form}
                        mode={mode}
                        offerId={offerId}
                        index={index}
                        customerId={customerId}
                        sourcePositionId={originalPosition.id}
                        closeFn={() => setEdit(false)}
                    />
                )}

                {!edit && (
                    <div className="flex items-center justify-between border-t border-(--border) p-2">
                        <div></div>
                        <div className="flex items-center gap-2">
                            {/* In einer Erweiterung steht der Positionsumfang fest —
                                nur die Menge darf abweichen. */}
                            {!isExtension && onRemove && (
                                <Button type="button" size="xs" variant="secondary" icon={<Trash size={14} />} iconOnly danger
                                    onClick={onRemove} />
                            )}
                            <Button type="button" size="xs" variant="secondary" icon={<Pen size={14} />} iconOnly
                                onClick={() => setEdit(true)} />
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
