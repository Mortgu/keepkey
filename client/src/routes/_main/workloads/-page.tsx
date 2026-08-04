import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Fragment } from "react";
import ProductModal from "./-components/product-modal";
import ProductList from "./-components/product-list";
import { Button, PageWidth } from "@/components";
import { useModal, useProductManager } from "@/hooks";

export default function ProductPage() {
    const { t } = useTranslation()
    const { createProduct } = useProductManager();

    const modal = useModal();

    return (
        <Fragment>
            <PageWidth variant="none">
                {/* Header */}
                <div className="grid gap-4 px-8 py-6 border-b border-(--border)">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 grid gap-1">
                            <h1 className="font-medium text-xl">{t('section.workloads')}</h1>
                            <p className="font-light text-sm text-gray-400">
                                Zentrale Workload verwaltung
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                icon={<Plus size={14} strokeWidth={3} />}
                                variant="primary"
                                size="sm"
                                onClick={() => modal.open()}
                            >
                                {t("button.create")}
                            </Button>
                        </div>
                    </div>
                </div>

                <ProductList />
            </PageWidth>

            {modal.isOpen && (
                <ProductModal
                    key={modal.key}
                    onClose={modal.close}
                    submitFn={(value) => createProduct({ ...value })}
                    currentItem={modal.data}
                />
            )}
        </Fragment>
    )
}
