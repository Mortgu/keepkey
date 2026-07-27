import { Button } from "@/components";
import type { CreateOfferDiscountInput } from "@keepit/schemas";
import { formatEur } from "@/utils/utils";
import { Pen, Trash } from "lucide-react";
import { useState } from "react";
import DiscountFormOfferModal from "./discount-form";

interface Props {
    discount: CreateOfferDiscountInput;
    updateFn: (discount: CreateOfferDiscountInput) => void;
    deleteFn: () => void;
}

export default function DiscountItemOfferModal({ discount, updateFn, deleteFn }: Props) {
    const [isEdit, setEdit] = useState<boolean>(false);

    return (
        <div className="grid bg-(--subtle-50) border border-(--border) rounded-md">
            <div className="flex items-center justify-between px-4 py-3 gap-4">

                <div className="grid gap-0.5">
                    <p className="text-sm font-medium">{discount.title}</p>
                    {discount.description && (
                        <p className="text-sm text-(--text-secondary)">{discount.description}</p>
                    )}
                </div>

                <div className="flex items-center gap-12">
                    <p className="text-sm  font-mono">-{formatEur(discount.amount_cents)}</p>

                    {/* actions */}
                    <div className="flex items-center gap-2">
                        <Button variant="border" type="button" size="sm" disabled={isEdit} icon={
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
                <DiscountFormOfferModal
                    currentDiscount={discount}
                    cancelFn={() => setEdit(false)}
                    saveFn={(d) => { updateFn(d); setEdit(false); }}
                />
            )}
        </div>
    );
}