import { Button, Checkbox } from "@/components";
import { Plus } from "lucide-react";
import { useState } from "react"
import OfferProductForm, { type OfferProductInput } from "../offer-product-form";
import { useContractHook, useProductHook } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { getPrice } from "@/data/products";
import ProductSectionItem from "./product-section-item";

type Props = {
    offerProducts: OfferProductInput[];
    setOfferProducts: React.Dispatch<React.SetStateAction<OfferProductInput[]>>;
}

export default function ProductModalSection({ offerProducts, setOfferProducts }: Props) {
    const [showForm, setShowForm] = useState<boolean>(false);
    const [totalPrice, setTotalPrice] = useState(0);

    const { products } = useProductHook();
    const { contracts } = useContractHook();

    const { isPending, mutateAsync } = useMutation({
        mutationKey: ['price'],
        mutationFn: ({ productId, contractId, quantity, duration }: {
            productId: string, contractId: string, quantity: number, duration: number,
        }) => getPrice(productId, contractId, duration, quantity),
        onSuccess: (value) => {
            setTotalPrice((prev) => prev + value);
        }
    });

    return (
        <div className="grid gap-4">
            <hr className="text-gray-200" />
            <div className="grid gap-4">

                {/* Produkt Sektions Header */}
                <div className="flex items-center justify-between w-full">
                    <Checkbox label="Vergleichen?" />
                    <Button variant="link" size="fit_sm" disabled={showForm} icon={<Plus className="size-4" />}
                        onClick={() => setShowForm(true)}>
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
                        const product = products.find((f) => f.id == offerProduct.productId);
                        const contract = contracts.find((c) => c.id == offerProduct.contractId);

                        if (!product || !contract) return null;

                        const op = Object.assign(offerProduct, product);

                        return <ProductSectionItem offerProduct={op} offerContract={contract} setOfferProducts={setOfferProducts}
                            index={index} onUpdate={async (data) => {
                                setOfferProducts(offerProducts.filter((p, i) => i !== index))

                                data.total_cents = await mutateAsync({
                                    productId: data.productId,
                                    contractId: data.contractId,
                                    quantity: data.quantity,
                                    duration: data.duration_months,
                                });

                                setOfferProducts((prev) => [...prev, data]);
                            }} />
                    })}
                </div>

                {showForm && (
                    <OfferProductForm onSave={async (data) => {
                        data.total_cents = await mutateAsync({
                            productId: data.productId,
                            contractId: data.contractId,
                            quantity: data.quantity,
                            duration: data.duration_months,
                        });
                        setOfferProducts((prev) => [...prev, data]);
                        setShowForm(false);
                    }} onCancel={() => setShowForm(false)} />
                )}

            </div>
        </div>
    )
}