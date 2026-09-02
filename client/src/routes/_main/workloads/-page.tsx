import { useTranslation } from "react-i18next";
import ProductModal from "./-components/product-modal";
import { Breadcrumbs, Button } from "@/components";
import { useModal, useProductManager } from "@/hooks";
import GlobalSearch from "../-components/global-search";
import ProductList from "./-components/product-list";

export default function ProductPage() {
    const { t } = useTranslation()
    const { createProduct } = useProductManager();

    const modal = useModal();

    return (
        <div className="mx-4">

            {/* Global Page Header with Global Search + Breadcrumbs */}
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-16">
                <GlobalSearch />
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-10">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Startseite", to: "/" },
                        { label: "Workloads", to: "/workloads" },
                    ]}
                />

            </div>

            {/* Page Header with Title + Actions */}
            <div className="flex items-center justify-between my-6">
                {/* Title + Description */}
                <div className="grid gap-1">
                    <h1 className="text-xl font-medium">Workloads</h1>
                    <p className='text-sm text-gray-500'>Todo: Write a short page description text here</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Create Workload Action */}
                    <Button size="sm" onClick={() => modal.open()} disabled={modal.isOpen}>
                        {t("button.create")}
                    </Button>
                </div>
            </div>

            <ProductList />

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
