import { useState } from "react";
import { tv } from "tailwind-variants";
import type { ChangeEvent } from "react";
import type { Contract, Product } from "@/types";
import type { OfferProductInput } from "./offer-product-form";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { Pen, Trash, X } from "lucide-react";
import { Button } from "@/components";
import OfferProductForm from "./offer-product-form";
import { formatEur } from "@/utils/utils";

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
    base: [
        "grid bg-(--subtle-50) border border-(--border) rounded-md"
    ],
    variants: {
        edit: {
            true: "border-(--primary)",
            false: ""
        }
    }
})

export default function ProductSectionItem(props: Props) {
    const { offerProduct, offerContract, onUpdate, onRemove, onPriceChange } = props;

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

            <div className="flex items-center justify-between px-4 py-3 ">
                <div className="grid">
                    <p className="flex items-center gap-1 text-sm font-normal">
                        {offerProduct.quantity} <X className="size-3" />{" "}
                        {localized(offerProduct.translations, locale, "name")}
                    </p>
                    <div className="flex items-center">
                        <p className="text-sm text-(--text-secondary)">
                            {localized(offerContract.translations, locale, "name")}{" "}
                            | {offerProduct.duration_months} Monate
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                    <p>{formatEur(offerProduct.total_cents)}</p>

                    <Button variant="secondary" type="button" size="xs" disabled={edit}
                        icon={<Pen className="size-3" />} iconOnly onClick={() => setEdit(true)} />

                    <Button variant="secondary" type="button" size="xs"
                        icon={<Trash className="size-3" />} iconOnly onClick={onRemove} />
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
