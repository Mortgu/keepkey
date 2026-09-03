import { useTranslation } from "react-i18next";
import ProductModal from "./-components/product-modal";
import { Breadcrumbs, Button, SortDropdown } from "@/components";
import { useLocale, useModal, useProductManager } from "@/hooks";
import useWorkloadFilters from "./-hooks/use-workload-filters";
import ProductAutocomplete from "./-components/product-autocomplete";
import { localized } from "@/lib/i18n-content";
import type { Product } from "@keepit/schemas";
import ProductItem from "./-components/product-item";

export default function ProductPage() {
    const locale = useLocale();
    const { t } = useTranslation();

    const filters = useWorkloadFilters();

    const { products, createProduct } = useProductManager(filters.params);

    const modal = useModal();

    return (
        <div className="grid gap-4 mx-4">

            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: "Workloads", to: "/workloads" },
                    ]}
                />
            </div>

            <div className="flex items-center gap-4">
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

                <Button size="sm" onClick={() => modal.open()}>
                    {t("workloads.create")}
                </Button>
            </div>

            {products.map((product: Product) => (
                <ProductItem key={product.id} product={product} />
            ))}

            {modal.isOpen && (
                <ProductModal
                    key={modal.key}
                    onClose={modal.close}
                    submitFn={(value) => createProduct({ ...value })}
                    currentItem={modal.data}
                />
            )}
        </div>
    )
}
