import {useState} from "react";
import type {Customer, Product} from "@/types";
import {useCustomerHook, useLocale, useProductHook, useTariffHook} from "@/hooks";
import {localized} from "@/lib/i18n-content";
import {SegmentedToggle, Select} from "@/components";
import {useParams} from "@tanstack/react-router";
import TariffComponent from "./-components/tariff-component.tsx";

type PricingMode = "customer" | "default";

const DEFAULT_MODE_OPTIONS: Array<{ value: PricingMode; label: string }> = [
    {value: "default", label: "Standardpreise"},
    {value: "customer", label: "Kundenpreise"},
];

export function ProductDetailContainer() {
    const params = useParams({from: "/_main/products/$id/"});

    const {customers} = useCustomerHook();
    const {getProduct} = useProductHook();

    const {data: product, isPending: isPendingProduct, error: isErrorProduct} = getProduct(params.id);

    if (isErrorProduct) {
        return <div>Error: Something went wrong trying to fetch product!</div>;
    }

    if (isPendingProduct || !product) {
        return <div>isPending</div>;
    }

    return <ProductDetailPage key={product.id} product={product} customers={customers}/>;
}

interface ProductDetailPageProps {
    customers: Array<Customer>;
    product: Product;
}

export function ProductDetailPage({customers, product}: ProductDetailPageProps) {
    const locale = useLocale();

    const [pricingMode, setPricingMode] = useState<PricingMode>("default");
    const [selectedCustomer, setSelectedCustomer] = useState<string>("");

    const {tariffs, addTerm, updateTerm, removeTerm, addBand, removeBand, updateCell} = useTariffHook(product.id);

    return (
        <div className="grid gap-5">
            <div className="grid gap-4 ">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-medium text-(--text)">
                            {localized(product?.translations, locale, "name")}
                        </h2>
                        <p className="mt-1 max-w-2xl text-sm text-(--text-600)">
                            {localized(product?.translations, locale, "description")}
                        </p>
                    </div>
                </div>
            </div>

            <section className="flex items-center justify-between rounded-md gap-4">
                <SegmentedToggle
                    aria-label="Preismodus"
                    options={DEFAULT_MODE_OPTIONS}
                    value={pricingMode}
                    onChange={(val) => setPricingMode(val as PricingMode)}
                />

                {pricingMode === "customer" && (
                    <Select onChange={(e) => setSelectedCustomer(e.target.value as string)}>
                        <option>Select customer...</option>
                        {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>{customer.companyName}</option>
                        ))}
                    </Select>
                )}
            </section>

            <div className="grid gap-4">
                {tariffs.map((tariff) => (
                    <TariffComponent
                        key={tariff.id}
                        tariff={tariff}
                        onAddTerm={addTerm}
                        onRemoveTerm={removeTerm}
                        onUpdateTerm={updateTerm}
                        onAddBand={addBand}
                        onRemoveBand={removeBand}
                        onUpdateCell={updateCell}
                    />
                ))}
            </div>
        </div>
    );
}
