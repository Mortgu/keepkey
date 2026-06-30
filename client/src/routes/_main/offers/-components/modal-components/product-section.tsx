import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import OfferProductForm from "./offer-product-form";
import ProductSectionItem from "./product-section-item";
import type { OfferProductInput } from "./offer-product-form";
import { useProductHook } from "@/hooks";
import { Button } from "@/components";
import { useContracts } from "@/hooks/contracts/contract-hooks";

type Props = {
    offerProducts: Array<OfferProductInput>;
    onAdd: (data: OfferProductInput) => Promise<void>;
    onUpdate: (index: number, data: OfferProductInput) => Promise<void>;
    onRemove: (index: number) => void;
    onPriceChange: (index: number, price: number) => void;
};

export default function ProductModalSection({
    offerProducts,
    onAdd,
    onUpdate,
    onRemove,
    onPriceChange,
}: Props) {
    const [showForm, setShowForm] = useState<boolean>(false);

    const { products } = useProductHook();
    const { contracts } = useContracts();

    const productMap = useMemo(
        () => new Map(products.map((p) => [p.id, p])),
        [products],
    );
    const contractMap = useMemo(
        () => new Map(contracts.map((c) => [c.id, c])),
        [contracts],
    );

    return (
        <div className="grid gap-4">
            <hr className="text-gray-200" />
            <div className="grid gap-4">
                <div className="flex items-center justify-between w-full">
                    <Button
                        variant="link"
                        size="fit_sm"
                        disabled={showForm}
                        icon={<Plus className="size-4" />}
                        onClick={() => setShowForm(true)}
                    >
                        Produkt hinzufügen
                    </Button>
                </div>

                {offerProducts.length === 0 && !showForm && (
                    <p className="text-sm text-gray-500 text-center py-2">
                        Noch kein Produkt hinzugefügt
                    </p>
                )}

                <div className="grid gap-2">
                    {offerProducts.map((offerProduct, index) => {
                        const product = productMap.get(offerProduct.productId);
                        const contract = contractMap.get(offerProduct.contractId);

                        if (!product || !contract) return null;

                        const op = { ...product, ...offerProduct };

                        return (
                            <ProductSectionItem
                                key={`${offerProduct.productId}-${offerProduct.contractId}-${offerProduct.duration_months}`}
                                offerProduct={op}
                                offerContract={contract}
                                index={index}
                                onUpdate={(data) => onUpdate(index, data)}
                                onRemove={() => onRemove(index)}
                                onPriceChange={(price) =>
                                    onPriceChange(index, price)
                                }
                            />
                        );
                    })}
                </div>

                {showForm && (
                    <OfferProductForm
                        onSave={async (data) => {
                            await onAdd(data);
                            setShowForm(false);
                        }}
                        onCancel={() => setShowForm(false)}
                    />
                )}
            </div>
        </div>
    );
}
