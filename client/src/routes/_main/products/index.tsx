import { createFileRoute } from '@tanstack/react-router'
import ProductList from './-components/product-list';
import {useTranslation} from "react-i18next";
import {Button, SearchBar} from "@/components";
import {Plus} from "lucide-react";
import {useState} from "react";
import {useModal, useProductHook} from "@/hooks";
import ProductModal from "@/routes/_main/products/-components/product-modal.tsx";

export const Route = createFileRoute('/_main/products/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const { products, isPending, error, createProduct } = useProductHook();

  const modal = useModal();

  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
      <div className="grid gap-4">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-medium">{t('products')}</h1>
        </div>

        {/* Page header actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="w-full flex items-center gap-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery}
                       onSubmit={() => { }} placeholder="Nach Produkt Namen suchen" />

            <div className="flex items-center gap-2">
              <Button onClick={() => modal.open()} size="sm">
                Erstellen <Plus className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* body */}
        <div className="grid gap-4">
          <ProductList products={products} />
        </div>

        {modal.isOpen && (
            <ProductModal key={modal.key} onClose={modal.close}
                submitFn={(value) => createProduct({ ...value })} />
        )}
      </div>
  )
}
