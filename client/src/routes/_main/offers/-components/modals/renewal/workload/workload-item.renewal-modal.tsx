import { Check, LoaderCircle, MoveRight, Pen, Trash } from "lucide-react";
import { Fragment, useState } from "react";
import WorkloadItemFormRenwalModal from "./workload-item-form.renewal-modal";
import type { CreateOfferPositionInput, OfferPosition } from "@keepit/schemas";
import type { RenewalFormApi } from "../hook/use-renewal-form";
import { Button } from "@/components";
import { useLocale, usePrice } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";

interface Props {
    form: RenewalFormApi;
    index: number;
    customerId: string;
    originalPosition: OfferPosition;
}

export default function WorkloadItemRenewalModal({ form, index, customerId, originalPosition }: Props) {
    const locales = useLocale();
    const [edit, setEdit] = useState<boolean>(false);
    const [deleted, setDeleted] = useState<boolean>(false);

    const position = form.store.state.values.offerPositions[index];
    //const position = useStore(form.store, (s) => s.values.offerPositions[index]);

    const priceWorkload: CreateOfferPositionInput = {
        productId: position.productId,
        contractId: position.contractId,
        duration_months: position.duration_months,
        quantity: position.quantity,
        free_months: position.free_months,
        optional: position.optional,
        total_cents: 0,
        eur_user_month: 0,
        discount_cents: 0,
    };

    const { price, isPending: pricePending } = usePrice(customerId, priceWorkload);

    const newTotalCents = price?.price ?? 0;
    const priceChanged = (originalPosition.total_cents - originalPosition.discount_cents) !== newTotalCents;
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
                            <span className="text-xs text-gray-500">Laufzeit</span>
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
                            <span className="text-xs text-gray-500">Stück</span>
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
                            <span className="text-xs text-gray-500">Total</span>
                            <div className="flex items-center gap-2">
                                {priceChanged && (
                                    <>
                                        <span className="text-md font-mono font-normal line-through">{formatEur((originalPosition.duration_months - originalPosition.free_months) * originalPosition.eur_user_month * originalPosition.quantity)}</span>
                                        <MoveRight size={14} className="text-gray-500" />
                                    </>
                                )}
                                {pricePending ? (
                                    <LoaderCircle size={14} className="animate-spin" />
                                ) : (
                                    <span className="text-md font-mono font-normal">{formatEur(newTotalCents)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {edit && (
                    <WorkloadItemFormRenwalModal
                        form={form}
                        index={index}
                        customerId={customerId}
                        closeFn={() => setEdit(false)}
                    />
                )}

                {!edit && (
                    <div className="flex items-center justify-between border-t border-(--border) p-2">
                        <div></div>
                        <div className="flex items-center gap-2">
                            {!deleted && (
                                <Button type="button" size="xs" variant="secondary" icon={<Trash size={14} />} iconOnly danger
                                    onClick={() => setDeleted(true)} />
                            )}
                            {deleted && (
                                <Button type="button" size="xs" variant="secondary" icon={<Check size={14} />} iconOnly
                                    onClick={() => setDeleted(false)} />
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