import {useTranslation} from "react-i18next";
import {LoaderCircle, Plus} from "lucide-react";
import {useState} from "react";
import ProductList from './-components/product-list';
import {Button, SearchBar} from "@/components";
import {useModal, useProductHook} from "@/hooks";
import ProductModal from "@/routes/_main/products/-components/product-modal.tsx";

export default function ProductPage() {
    const {t} = useTranslation()
    const {
        products,
        isPending,

        createProduct,
        isCreatingProduct,
    } = useProductHook();

    const modal = useModal();

    const [searchQuery, setSearchQuery] = useState<string>("");

    const renderLoading = () => {
        return (
            <div className="flex items-center justify-center my-5">
                <LoaderCircle className="animate-spin"/>
            </div>
        )
    }

    return (
        <div className="grid gap-4">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-medium">{t('section.products')}</h1>
            </div>

            {/* Page header actions */}
            <div className="flex items-center justify-between gap-4">
                <div className="w-full flex items-center gap-4">
                    <SearchBar value={searchQuery} onChange={setSearchQuery}
                               onSubmit={() => {
                               }} placeholder="Nach Produkt Namen suchen"/>

                    <div className="flex items-center gap-2">
                        <Button onClick={() => modal.open()} size="sm">
                            {t('button.create')} <Plus className="size-4"/>
                        </Button>
                    </div>
                </div>
            </div>

            {/* body */}
            <div className="grid gap-4">
                {isPending ? renderLoading() : (
                    <ProductList products={products}/>
                )}
            </div>

            {modal.isOpen && (
                <ProductModal key={modal.key} onClose={modal.close}
                              submitFn={(value) => createProduct({...value})}/>
            )}
        </div>
    )
}
