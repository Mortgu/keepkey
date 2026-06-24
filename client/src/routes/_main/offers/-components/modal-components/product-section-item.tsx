import { Pen, Trash, X } from "lucide-react";
import { useState } from "react";
import { tv } from "tailwind-variants";
import OfferProductForm from "./offer-product-form";
import type { ChangeEvent } from "react";
import type { Contract, Product } from "@/types";
import type { OfferProductInput } from "./offer-product-form";
import { formatEur } from "@/utils/utils";
import { Button, Input } from "@/components";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";

type OfferProduct = Product & OfferProductInput;

type Props = {
    offerProduct: OfferProduct;
    offerContract: Contract;
    index: number;
    onUpdate: (data: OfferProductInput) => void;
    onRemove: () => void;
    onPriceChange: (price: number) => void;
}

const styles = tv({
    base: ["grid gap-2"],
    variants: {
        edit: {
            true: "outline-2 outline-offset-2 rounded-md outline-(--primary)",
            false: ""
        }
    }
})

export default function ProductSectionItem({
    offerProduct,
    offerContract,
    onUpdate,
    onRemove,
    onPriceChange,
}: Props) {
    const [edit, setEdit] = useState<boolean>(false);
    const [editPrice, setEditPrice] = useState<boolean>(false);
    const [price, setPrice] = useState(offerProduct.total_cents);

    const locale = useLocale();

    const displayPrice = editPrice ? price : offerProduct.total_cents;

    const startEditPrice = () => {
        setPrice(offerProduct.total_cents);
        setEditPrice(true);
    };

    const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (isNaN(value)) return;
        setPrice(value);
    };

    const handlePriceBlur = () => {
        onPriceChange(price);
        setEditPrice(false);
    };

    return (
        <div className={styles({ edit })}>
            <div className="flex items-center justify-between bg-(--subtle-50) border border-(--border) px-3 py-2 rounded-md">
                <div className="grid">
                    <p className="flex items-center gap-1 text-sm">
                        {offerProduct.quantity} <X className="size-3" />{" "}
                        {localized(offerProduct.translations, locale, "name")}
                    </p>
                    <div className="flex items-center">
                        <p className="text-xs text-(--text-secondary)">
                            {localized(offerContract.translations, locale, "name")}{" "}
                            | {offerProduct.duration_months} Monate
                        </p>
                    </div>
                </div>

                <div className="flex gap-1">
                    {!editPrice && (
                        <Button type="button" size="xs" variant="link" onClick={startEditPrice}>
                            {formatEur(offerProduct.total_cents)}
                        </Button>
                    )}

                    {editPrice && (
                        <Input
                            autoFocus
                            size="xs"
                            value={displayPrice}
                            onChange={handlePriceChange}
                            onBlur={handlePriceBlur}
                        />
                    )}

                    <Button
                        disabled={edit}
                        type="button"
                        size="xs"
                        variant="secondary"
                        icon={<Pen className="size-3" />}
                        iconOnly
                        onClick={() => setEdit(true)}
                    />

                    <Button
                        type="button"
                        size="xs"
                        variant="secondary"
                        icon={<Trash className="size-3" />}
                        iconOnly
                        onClick={onRemove}
                    />
                </div>
            </div>

            {edit && (
                <OfferProductForm
                    currentProduct={offerProduct}
                    onSave={(data) => {
                        onUpdate(data);
                        setEdit(false);
                    }}
                    onCancel={() => setEdit(false)}
                />
            )}
        </div>
    );
}
