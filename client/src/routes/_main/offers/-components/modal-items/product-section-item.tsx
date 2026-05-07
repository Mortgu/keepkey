import type { Contract, Product } from "@/types";
import type { OfferProductInput } from "../offer-product-form";
import { DollarSign, Loader, Pen, Trash, X } from "lucide-react";
import { formatEur } from "@/utils/utils";
import { Button } from "@/components";
import { Fragment, useState } from "react";
import OfferProductForm from "../offer-product-form";
import { tv } from "tailwind-variants";

type OfferProduct = Product & OfferProductInput;

type Props = {
    offerProduct: OfferProduct;
    offerContract: Contract;

    setOfferProducts: React.Dispatch<React.SetStateAction<OfferProductInput[]>>;

    index: number;

    onUpdate: (data: OfferProductInput) => void;
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

export default function ProductSectionItem({ offerProduct, offerContract, setOfferProducts, onUpdate, index }: Props) {
    const [edit, setEdit] = useState<boolean>(false);

    return (
        <div className={styles({ edit: edit })}>
            <div className="flex items-center justify-between bg-(--subtle-50) border border-(--border) px-3 py-2 rounded-md">
                <div className="grid">
                    <p className="flex items-center gap-1 text-sm">{offerProduct.quantity} <X className="size-3" /> {offerProduct.name}</p>
                    <div className="flex items-center">
                        <p className="text-xs text-(--text-secondary)">{offerContract.name} | {offerProduct.duration_months} Monate</p>
                    </div>
                </div>

                <div className="flex gap-1">
                    <Button type="button" size="xs" variant="secondary"
                        icon={<DollarSign className="size-3" />}
                        onClick={() => { }}>
                        {formatEur(offerProduct.total_cents)}
                    </Button>

                    <Button disabled={edit} type="button" size="xs" variant="secondary"
                        icon={<Pen className="size-3" />} iconOnly
                        onClick={() => setEdit(true)} />

                    <Button type="button" size="xs" variant="secondary"
                        icon={<Trash className="size-3" />} iconOnly
                        onClick={() => setOfferProducts((prev) => prev.filter((_, i) => i !== index))} />
                </div>
            </div>

            {edit && (
                <OfferProductForm currentProduct={offerProduct} onSave={(data) => {
                    onUpdate(data);
                    setEdit(false);
                }} onCancel={() => setEdit(false)} />
            )}
        </div>
    )
}