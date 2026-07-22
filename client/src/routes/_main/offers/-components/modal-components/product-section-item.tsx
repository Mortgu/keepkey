import { Button } from "@/components";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { Contract, Product } from "@/types";
import { formatEur } from "@/utils/utils";
import { Pen, Trash, X } from "lucide-react";
import { useState } from "react";
import { tv } from "tailwind-variants";
import type { OfferProductInput } from "./offer-product-form";
import OfferProductForm from "./offer-product-form";

type OfferProduct = Product & OfferProductInput;

type Props = {
    offerProduct: OfferProduct;
    offerContract: Contract;
    index: number;
    customerId: string;
    onUpdate: (data: OfferProductInput) => void;
    onRemove: () => void;
    onPersistOverride: (
        data: OfferProductInput,
        unitPriceCents: number,
    ) => Promise<number>;
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
    const { offerProduct, offerContract, onUpdate, onRemove, onPersistOverride } = props;

    const [edit, setEdit] = useState<boolean>(false);

    const locale = useLocale();

    return (
        <div className={styles({ edit })}>

            <div className="flex items-center justify-between px-4 py-3 gap-4">
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

                {/* Right */}
                <div className="flex items-center gap-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm">{formatEur(offerProduct.total_cents)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button variant="border" type="button" size="sm" disabled={edit}
                            icon={<Pen size={14} />} iconOnly onClick={() => setEdit(true)} />

                        <Button variant="border" type="button" size="sm"
                            icon={<Trash size={14} />} iconOnly onClick={onRemove} />
                    </div>
                </div>

            </div>

            {edit && (
                <OfferProductForm
                    currentProduct={offerProduct}
                    customerId={props.customerId}
                    onPersistOverride={onPersistOverride}
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
