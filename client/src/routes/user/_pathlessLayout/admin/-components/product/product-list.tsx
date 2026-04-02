import { Loader, Plus } from "lucide-react";
import Button from "@/components/button/button.tsx";
import { useState } from "react";
import ProductItem, { type ProductItemProps } from "@/routes/user/_pathlessLayout/admin/-components/product/product-item.tsx";
import ProductModal from "./product-modal";
import { useAdmin } from "@/hooks/admin";

export default function ProductList() {
    const [isOpen, setOpen] = useState<boolean>(false);
    const { products, pendingProducts: isPending, errorProducts: error, createProduct } = useAdmin();

    if (isPending) {
        return (
            <Loader className='animate-spin' />
        )
    }

    if (error) {
        return (
            <div className='p-2 bg-red-200 border border-red-400 rounded-lg'>
                <p className="text-lg">Error</p>
                <p>{error.message}</p>
            </div>
        )
    }

    return (
        <div>
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Products ({products.length})</h1>
                <Button onClick={() => setOpen(true)} size='sm'>Create <Plus className='size-4' /></Button>
            </div>
            <div className='grid gap-2'>
                {products.map((product: ProductItemProps, index: number) => (
                    <ProductItem key={index} {...product} />
                ))}
            </div>

            {/* Product Modal */}
            <ProductModal isOpen={isOpen} onClose={() => setOpen(false)}
                onSubmit={(value) => createProduct({ ...value })} />
        </div>
    )
}