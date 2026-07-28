import { Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Check, MoveRight, Pen, Trash } from "lucide-react";
import DiscountItemFormRenwalModal from "./discount-item-form.renewal-modal";
import type { OfferDiscount } from "@keepit/schemas";
import type { DiscountItemState } from "./discount.renewal-modal";
import { Button } from "@/components";
import { formatEur } from "@/utils/utils";

interface Props {
    index: number;
    originalDiscount: OfferDiscount;
    item: DiscountItemState;
    onUpdate: (index: number, updated: { title: string; description?: string; amount_cents: number }) => void;
    onToggleDelete: (index: number) => void;
}

export default function DiscountItemRenewalModal({ index, originalDiscount, item, onUpdate, onToggleDelete }: Props) {
    const [edit, setEdit] = useState<boolean>(false);

    const amountChanged = originalDiscount.amount_cents !== item.amount_cents;

    return (
        <Fragment>
            <div className="border border-(--border) rounded-md overflow-hidden">
                <div className="flex items-start justify-between bg-(--subtle-50) px-4 py-3">
                    <div className="grid gap-1">
                        <p className={`font-normal ${item.deleted ? "text-gray-400 line-through" : ""}`}>
                            {item.title}
                        </p>
                        <p className={`font-normal text-xs ${item.deleted ? "text-gray-400 line-through" : ""}`}>
                            {item.description}
                        </p>
                    </div>

                    <div className="relative divide-x divide-(--border) flex items-center">
                        <div className="flex-1 min-w-fit grid items-center px-4 last:pr-0">
                            <span className="text-xs text-gray-500">Total</span>
                            <div className="flex items-center gap-2">
                                {amountChanged && (
                                    <>
                                        <span className="text-md font-mono font-normal line-through">
                                            {formatEur(-originalDiscount.amount_cents)}
                                        </span>
                                        <MoveRight size={14} className="text-gray-500" />
                                    </>
                                )}
                                <span className="text-md font-mono font-normal">{formatEur(-item.amount_cents)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {edit && !item.deleted && (
                    <DiscountItemFormRenwalModal
                        item={item}
                        closeFn={() => setEdit(false)}
                        saveFn={(updated) => {
                            onUpdate(index, updated);
                            setEdit(false);
                        }}
                    />
                )}

                {!edit && (
                    <div className="flex items-center justify-between border-t border-(--border) p-2">
                        <div></div>
                        <div className="flex items-center gap-2">
                            {!item.deleted && (
                                <Button
                                    type="button"
                                    size="xs"
                                    variant="secondary"
                                    icon={<Trash size={14} />}
                                    iconOnly
                                    danger
                                    onClick={() => onToggleDelete(index)}
                                />
                            )}
                            {item.deleted && (
                                <Button
                                    type="button"
                                    size="xs"
                                    variant="secondary"
                                    icon={<Check size={14} />}
                                    iconOnly
                                    onClick={() => onToggleDelete(index)}
                                />
                            )}
                            <Button
                                type="button"
                                size="xs"
                                variant="secondary"
                                icon={<Pen size={14} />}
                                iconOnly
                                disabled={item.deleted}
                                onClick={() => setEdit(true)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
}
