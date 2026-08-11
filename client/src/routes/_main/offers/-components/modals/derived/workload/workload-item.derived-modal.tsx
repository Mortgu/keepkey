import { useStore } from "@tanstack/react-form";
import { LoaderCircle, MoveRight, Pen, Trash, TriangleAlert } from "lucide-react";
import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { netCents } from "@keepit/schemas";
import { priceSourceFor } from "../hook/use-derived-form";
import WorkloadItemFormDerivedModal from "./workload-item-form.derived-modal";
import type { OfferPosition } from "@keepit/schemas";
import type { DerivedFormApi, DerivedMode } from "../hook/use-derived-form";
import { Button, Checkbox } from "@/components";
import { useLocale, usePositionPrice } from "@/hooks";
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

export default function WorkloadItemDerivedModal(props: Props) {
    const {
        form,
        mode,
        offerId,
        index,
        customerId,
        originalPosition,
        onRemove
    } = props;

    const { t } = useTranslation();
    const locales = useLocale();
    const [edit, setEdit] = useState<boolean>(false);
    const [checked, setChecked] = useState<boolean>(true);

    const position = useStore(form.store, (s) => s.values.offerPositions[index]);

    const isExtension = mode === "extension";

    const { netCents: newTotal, isLoading, hasPrice, fromSnapshot } = usePositionPrice({
        source: priceSourceFor(mode),
        query: {
            customerId,
            ...position
        },
        pin: { offerId, positionId: originalPosition.id },
    });

    // Beide Seiten netto, also nach Abzug der Freimonate — sonst meldet der
    // Vergleich bei Freimonaten eine Preisänderung, die keine ist.
    const originalTotal = netCents(originalPosition);

    const priceChanged = originalTotal !== newTotal;
    const quantityChanged = originalPosition.quantity !== position.quantity;
    const durationChanged = originalPosition.duration !== position.duration;

    return (
        <Fragment>
            <div className="border border-(--border) rounded-md overflow-hidden">
                <div className="flex items-center justify-between bg-(--subtle-50) px-4 py-3">

                    {/* Checkbox + Product name + contract */}
                    <div className="flex items-center gap-4">
                        <Checkbox checked={checked} onChange={() => setChecked(!checked)} />

                        <div className="grid">
                            <p className="font-normal">{localized(originalPosition.product.translations, locales, "name")}</p>
                            <p className="font-normal text-sm text-gray-400">{localized(originalPosition.contract.translations, locales, "name")}</p>
                        </div>
                    </div>

                    <div className="relative divide-x divide-(--border) flex items-center">

                        {/* duration */}
                        <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                            <span className="text-xs text-gray-500">{t("renewal.duration")}</span>
                            <div className="flex items-center gap-2">
                                {durationChanged && (
                                    <>
                                        <span className="text-md font-mono font-normal line-through">{originalPosition.duration} Mo.</span>
                                        <MoveRight size={14} className="text-gray-500" />
                                    </>
                                )}
                                <span className="text-md font-mono font-normal">{position.duration} Mo.</span>
                            </div>
                        </div>

                        {/* quantity */}
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
                                {isLoading ? (
                                    <LoaderCircle size={14} className="animate-spin" />
                                ) : (
                                    <span className="text-md font-mono font-normal">{formatEur(newTotal)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isExtension && hasPrice && !fromSnapshot && (
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
