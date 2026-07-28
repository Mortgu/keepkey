import { Button } from "@/components";
import { useLocale, usePrice } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { OfferPosition } from "@keepit/schemas";
import { Trash, Pen, MoveRight } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import WorkloadItemFormRenwalModal from "./workload-item-form.renewal-modal";
import useRenewalWorkloadForm from "../hook/use-renwal-workload-form";
import { useStore } from "@tanstack/react-form";

interface Props {
    customerId: string;
    workload: OfferPosition;
};

export default function WorkloadItemRenewalModal({ customerId, workload }: Props) {
    const { t } = useTranslation();
    const locales = useLocale();

    const [edit, setEdit] = useState<boolean>(false);
    const { form } = useRenewalWorkloadForm({
        closeFn: () => setEdit(false),
        workload: workload,
    });
    const { price, isPending: pricePending } = usePrice(customerId, workload);

    const currentQuantity = useStore(form.store, (s) => s.values.quantity);

    useEffect(() => {
        console.log(price)
    }, [currentQuantity]);

    return (
        <Fragment>
            <div className="border border-(--border) rounded-md overflow-hidden">
                <div className="flex items-center justify-between bg-(--subtle-50)  px-4 py-3 ">
                    <div className="grid">
                        <p className="font-normal">{localized(workload.product.translations, locales, "name")}</p>
                        <p className="font-normal text-sm text-gray-400">{localized(workload.contract.translations, locales, "name")}</p>
                    </div>

                    <div className="relative divide-x divide-(--border) flex items-center">
                        <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                            <span className="text-xs text-gray-500">Stück</span>
                            <div className="flex items-center gap-2">
                                {workload.quantity !== currentQuantity && (
                                    <>
                                        <span className="text-md font-mono font-normal line-through">{workload.quantity}</span>
                                        <MoveRight size={14} className="text-gray-500" />
                                    </>
                                )}
                                <span className="text-md font-mono font-normal">{currentQuantity}</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                            <span className="text-xs text-gray-500">Total</span>
                            <div className="flex items-center gap-2">
                                <span className="text-md font-mono font-normal line-through">21.387 €</span>
                                <MoveRight size={14} className="text-gray-500" />
                                <span className="text-md font-mono font-normal">11.090 €</span>
                            </div>
                        </div>
                    </div>
                </div>

                {edit && (
                    <WorkloadItemFormRenwalModal
                        customerId={customerId}
                        workload={workload}
                        form={form}
                    />
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


        </Fragment>
    )
}