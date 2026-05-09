import { useState } from "react";

import { Loader, Plus } from "lucide-react";

import ProductItem from "./product-item";
import ProductModal from "./product-modal";

import { Button, SearchBar } from "@/components";
import { useProductHook } from "@/hooks";
import type { Product } from "@/types";

export default function ProductList() {
  const [isOpen, setOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { products, isPending, error, createProduct } = useProductHook();

  if (isPending) {
    return <Loader className="animate-spin" />;
  }

  if (error) {
    return (
      <div className="p-2 bg-red-200 border border-red-400 rounded-lg">
        <p className="text-lg">Error</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Produkte</h1>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="w-full flex items-center gap-4">

          <SearchBar value={searchQuery} onChange={setSearchQuery}
            onSubmit={() => { }} placeholder="Nach Produkt Namen suchen" />


          <div className="flex items-center gap-2">
            <Button onClick={() => setOpen(true)} size="sm">
              Erstellen <Plus className="size-4" />
            </Button>
          </div>

        </div>
      </div>

      <div className="grid gap-4">
        {products.map((product: Product, index: number) => (
          <ProductItem key={index} {...product} />
        ))}
      </div>

      {/* Product Modal */}
      <ProductModal open={isOpen} cancelFn={() => setOpen(false)}
        submitFn={(value) => createProduct({ ...value })} />

    </div>
  );
}
