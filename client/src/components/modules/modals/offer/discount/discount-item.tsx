import { Pen, Trash } from "lucide-react";
import { useState } from "react";
import DiscountForm from "./discount-form";
import type { CreateOfferDiscountInput } from "@keepit/schemas";
import { formatEur } from "@/utils/utils";
import { Button } from "@/components";

interface Props {
    discount: CreateOfferDiscountInput;
    updateFn: (discount: CreateOfferDiscountInput) => void;
    /** Nicht gesetzt, wenn der Rabatt nicht entfernt werden darf. */
    deleteFn?: () => void;
}

export default function DiscountItem({ discount, updateFn, deleteFn }: Props) {
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
                <DiscountForm
                    currentDiscount={discount}
                    cancelFn={() => setEdit(false)}
                    saveFn={(d) => { updateFn(d); setEdit(false); }}
                />
            )}
        </div>
    );
}