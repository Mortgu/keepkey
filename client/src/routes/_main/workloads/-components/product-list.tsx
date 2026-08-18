import useWorkloadFilters from "../-hooks/use-workload-filters";
import ProductItem from "./product-item";
import type { Product } from "@keepit/schemas";
import { useLocale, useProducts } from "@/hooks";
import { SortDropdown } from "@/components";
import ProductAutocomplete from "./product-autocomplete";
import { localized } from "@/lib/i18n-content";

export default function ProductList() {
    const locale = useLocale();
    const filters = useWorkloadFilters();

    const { products } = useProducts(filters.params);

    return (
        <div>
            <div className="px-8 py-4 border-b border-(--border)">
                <div className="flex items-center w-full gap-2">
                    <SortDropdown
                        value={filters.sort}
                        onChange={filters.setSort}
                        options={filters.sortOptions}
                    />

                    <ProductAutocomplete
                        items={products.map(product => ({
                            title: localized(product.translations, locale, "name") ?? "",
                            description: localized(product.translations, locale, "description") ?? ""
                        }))}
                        filters={filters}
                    />
                </div>
            </div>

            <div className="grid gap-4 px-8 py-6">
                {products.map((product: Product) => (
                    <ProductItem key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}
