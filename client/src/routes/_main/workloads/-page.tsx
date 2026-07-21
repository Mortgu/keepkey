import { useTranslation } from "react-i18next";
import { LoaderCircle, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import ProductList from './-components/product-list';
import { Button, PageWidth, SearchBar } from "@/components";
import { useLocale, useModal, useProductManager } from "@/hooks";
import ProductModal from "@/routes/_main/workloads/-components/product-modal.tsx";
import { localized } from "@/lib/i18n-content";

export default function ProductPage() {
    const { t } = useTranslation()
    const {
        products,
        isPending,

        createProduct,
    } = useProductManager();

    const modal = useModal();
    const locale = useLocale();

    const [searchQuery, setSearchQuery] = useState<string>("");

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const query = searchQuery.toLowerCase();
        return products.filter((product) => {
            const name = localized(product.translations, locale, "name");
            return name.toLowerCase().includes(query);
        });
    }, [products, searchQuery, locale]);

    const renderLoading = () => {
        return (
            <div className="flex items-center justify-center my-5">
                <LoaderCircle className="animate-spin" />
            </div>
        )
    }

    return (
        <PageWidth>
            <div className="grid gap-4">
                {/* Page header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">{t('section.workloads')}</h1>
                </div>

                {/* Page header actions */}
                <div className="flex items-center justify-between gap-4">
                    <div className="w-full flex items-center gap-4">
                        <SearchBar value={searchQuery} onChange={setSearchQuery}
                            onSubmit={() => {
                            }} placeholder="Nach Produkt Namen suchen" />

                        <div className="flex items-center gap-2">
                            <Button onClick={() => modal.open()} size="sm">
                                {t('button.create')} <Plus className="size-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* body */}
                <div className="grid gap-4">
                    {isPending ? renderLoading() : (
                        <ProductList products={filteredProducts} />
                    )}
                </div>

                {modal.isOpen && (
                    <ProductModal key={modal.key} onClose={modal.close}
                        submitFn={(value) => createProduct({ ...value })} />
                )}
            </div>
        </PageWidth>
    )
}
