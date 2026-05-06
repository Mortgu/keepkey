import { useState } from "react";

import { Loader, Plus } from "lucide-react";

import ProductItem from "./product-item";
import ProductModal from "./product-modal";

import { Button } from "@/components";
import { useProductHook } from "@/hooks";
import type { Product } from "@/types";

export default function ProductList() {
  const [isOpen, setOpen] = useState<boolean>(false);

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
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
          Produkte ({products.length})
        </h1>
        <Button onClick={() => setOpen(true)} size="sm">
          Create <Plus className="size-4" />
        </Button>
      </div>
      <div className="grid gap-2">
        {products.map((product: Product, index: number) => (
          <ProductItem key={index} {...product} />
        ))}
      </div>

      {/* Product Modal */}
      <ProductModal
        open={isOpen}
        cancelFn={() => setOpen(false)}
        submitFn={(value) => createProduct({ ...value })}
      />
    </div>
  );
}
