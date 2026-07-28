import type { OfferDiscount } from "@keepit/schemas";
import type { RenewalFormApi } from "../hook/use-renewal-form";
import { Fragment } from "react/jsx-runtime";
import { useLocale } from "@/hooks";
import { useState } from "react";
import { useStore } from "@tanstack/react-form";
import { Button } from "@/components";
import { Pen, Trash } from "lucide-react";
import { formatEur } from "@/utils/utils";
import DiscountItemFormRenwalModal from "./discount-item-form.renewal-modal";

interface Props {
    form: RenewalFormApi;
    discount: OfferDiscount;
    index: number;
}

export default function DiscountItemRenewalModal({ form, discount, index }: Props) {
    const locales = useLocale();
    const [edit, setEdit] = useState<boolean>(false);

    const discounts = useStore(form.store, (s) => s.values.discounts[index]);

    return (
        <Fragment>
            <div className="border border-(--border) rounded-md overflow-hidden">
                <div className="flex items-start justify-between bg-(--subtle-50) px-4 py-3">
                    <div className="grid gap-1">
                        <p className="font-normal">
                            {discount.title}
                        </p>
                        <p className="font-normal text-xs">
                            {discount.description}
                        </p>
                    </div>

                    <div className="relative divide-x divide-(--border) flex items-center">

                        <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                            <span className="text-xs text-gray-500">Total</span>
                            <div className="flex items-center gap-2">
                                <span className="text-md font-mono font-normal">{formatEur(-discount.amount_cents)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {edit && (
                    <DiscountItemFormRenwalModal
                        form={form}
                        index={index}
                        closeFn={() => setEdit(false)}
                    />
                )}

                {!edit && (
                    <div className="flex items-center justify-between border-t border-(--border) p-2">
                        <div></div>
                        <div className="flex items-center gap-2">
                            <Button type="button" size="xs" variant="secondary" icon={<Trash size={14} />} iconOnly danger />
                            <Button type="button" size="xs" variant="secondary" icon={<Pen size={14} />} iconOnly
                                onClick={() => setEdit(true)} />
                        </div>
                    </div>
                )}
            </div>
        </Fragment >
    );
}