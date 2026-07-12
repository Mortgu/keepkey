import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import OfferProductForm from "./offer-product-form";
import ProductSectionItem from "./product-section-item";
import type { OfferProductInput } from "./offer-product-form";
import { useProductHook } from "@/hooks";
import { Button, Checkbox } from "@/components";
import { useContracts } from "@/hooks/contracts/contract-hooks";

type Props = {
    offerProducts: Array<OfferProductInput>;
    customerId: string;
    featureComparison: boolean;
    onToggleFeatureComparison: (value: boolean) => void;
    onAdd: (data: OfferProductInput) => Promise<void>;
    onUpdate: (index: number, data: OfferProductInput) => Promise<void>;
    onRemove: (index: number) => void;
    onPersistOverride: (
        data: OfferProductInput,
        unitPriceCents: number,
    ) => Promise<number>;
};

export default function ProductModalSection({
    offerProducts,
    customerId,
    featureComparison,
    onToggleFeatureComparison,
    onAdd,
    onUpdate,
    onRemove,
    onPersistOverride,
}: Props) {
    const [showForm, setShowForm] = useState<boolean>(false);
    const { t } = useTranslation();

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
            <hr className="text-(--border)" />
            <div className="grid gap-4">
                <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-gray-700">
                        Workloads
                    </span>
                    <Button
                        variant="link"
                        size="fit_sm"
                        disabled={showForm}
                        icon={<Plus className="size-4" />}
                        onClick={() => setShowForm(true)}
                    >
                        Workload hinzufügen
                    </Button>
                </div>

                <Checkbox
                    label={t("offerModal.compare")}
                    checked={featureComparison}
                    onChange={(e) => onToggleFeatureComparison(e.target.checked)}
                />

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
                                customerId={customerId}
                                onUpdate={(data) => onUpdate(index, data)}
                                onRemove={() => onRemove(index)}
                                onPersistOverride={onPersistOverride}
                            />
                        );
                    })}
                </div>

                {showForm && (
                    <div className="grid bg-(--subtle-50) border border-(--border) rounded-md">
                        <OfferProductForm
                            customerId={customerId}
                            onSave={async (data) => {
                                await onAdd(data);
                                setShowForm(false);
                            }}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
