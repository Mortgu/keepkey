import {useParams} from "@tanstack/react-router";
import type {Product} from "@/types";
import {localized} from "@/lib/i18n-content";
import {useContractHook, useLocale, useProductHook,} from "@/hooks";
import ContractCollapsable from "@/routes/_main/products/$id/-components/contract-collapsable.tsx";

export function ProductDetailContainer() {
    const params = useParams({from: "/_main/products/$id/"});

    const {getProduct} = useProductHook();

    const {
        data: product,
        isPending: isPendingProduct,
        error: isErrorProduct,
    } = getProduct(params.id);

    if (isErrorProduct) {
        return <div>Error: Something went wrong trying to fetch product!</div>;
    }

    if (isPendingProduct) {
        return <div>isPending</div>;
    }

    return (
        <ProductDetailPage key={product.id} product={product}/>
    );
}

interface ProductDetailPageProps {
    product: Product;
}

export function ProductDetailPage({product}: ProductDetailPageProps) {
    const locale = useLocale();

    const {contracts} = useContractHook();

    return (
        <div className="grid gap-5">
            <div className="grid gap-4 ">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-medium text-(--text)">
                            {localized(product.translations, locale, "name")}
                        </h2>
                        <p className="mt-1 max-w-2xl text-sm text-(--text-600)">
                            {localized(product.translations, locale, "description")}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {contracts.map((contract) => (
                    <ContractCollapsable
                        key={contract.id}
                        product={product}
                        contract={contract}
                    />
                ))}
            </div>
        </div>
    );
}
