import { useTranslation } from "react-i18next";
import useWorkloadFilters from "../-hooks/use-workload-filters";
import ProductItem from "./product-item";
import type { Product } from "@keepit/schemas";
import { useProducts } from "@/hooks";
import { SearchBar, SortDropdown } from "@/components";

export default function ProductList() {
    const { t } = useTranslation();
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

                    <SearchBar
                        className="flex-1"
                        value={filters.searchInput}
                        onChange={filters.setSearchInput}
                        onSubmit={() => { }}
                        placeholder={t("common.search")}
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
