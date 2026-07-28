import { useStore } from "@tanstack/react-form";
import { LoaderCircle, MoveRight, Pen, Trash } from "lucide-react";
import { Fragment, useState } from "react";
import useRenewalWorkloadForm from "../hook/use-renwal-workload-form";
import WorkloadItemFormRenwalModal from "./workload-item-form.renewal-modal";
import type { CreateOfferPositionInput, OfferPosition } from "@keepit/schemas";
import { Button } from "@/components";
import { useLocale, usePrice } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";

interface Props {
    customerId: string;
    workload: OfferPosition;
};

export default function WorkloadItemRenewalModal({ customerId, workload }: Props) {
    const locales = useLocale();

    const [edit, setEdit] = useState<boolean>(false);
    const { form } = useRenewalWorkloadForm({
        closeFn: () => setEdit(false),
        workload: workload,
    });

    const formValues = useStore(form.store, (s) => s.values);

    const priceWorkload: CreateOfferPositionInput = {
        productId: workload.productId,
        contractId: workload.contractId,
        duration_months: workload.duration_months,
        quantity: formValues.quantity,
        free_months: formValues.free_months,
        optional: workload.optional,
        total_cents: 0,
        eur_user_month: 0,
        discount_cents: 0,
    };

    const { price, isPending: pricePending } = usePrice(customerId, priceWorkload);
    const newTotalCents = price?.price ?? 0;
    const priceChanged = workload.total_cents !== newTotalCents;

    return (
        <Fragment>
            <div className="border border-(--border) rounded-md overflow-hidden">
                <div className="flex items-center justify-between bg-(--subtle-50) px-4 py-3 ">
                    <div className="grid">
                        <p className="font-normal">{localized(workload.product.translations, locales, "name")}</p>
                        <p className="font-normal text-sm text-gray-400">{localized(workload.contract.translations, locales, "name")}</p>
                    </div>

                    <div className="relative divide-x divide-(--border) flex items-center">
                        <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                            <span className="text-xs text-gray-500">Laufzeit</span>
                            <div className="flex items-center gap-2">
                                <span className="text-md font-mono font-normal">{workload.duration_months} Months</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                            <span className="text-xs text-gray-500">Stück</span>
                            <div className="flex items-center gap-2">
                                {workload.quantity !== formValues.quantity && (
                                    <>
                                        <span className="text-md font-mono font-normal line-through">{workload.quantity}</span>
                                        <MoveRight size={14} className="text-gray-500" />
                                    </>
                                )}
                                <span className="text-md font-mono font-normal">{formValues.quantity}</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                            <span className="text-xs text-gray-500">Total</span>
                            <div className="flex items-center gap-2">
                                {priceChanged && (
                                    <>
                                        <span className="text-md font-mono font-normal line-through">{formatEur(workload.total_cents)}</span>
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
                    <WorkloadItemFormRenwalModal form={form} closeFn={() => setEdit(false)} />
                )}

                {!edit && (
                    <div className="flex items-center justify-between border-t border-(--border) p-2">
                        <div></div>
                        <div className="flex items-center gap-2">
                            <Button size="xs" variant="secondary" icon={<Trash size={14} />} iconOnly danger />
                            <Button size="xs" variant="secondary" icon={<Pen size={14} />} iconOnly
                                onClick={() => setEdit(true)} />
                        </div>
                    </div>
                )}
            </div>


        </Fragment >
    )
}