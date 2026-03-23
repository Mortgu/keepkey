import { createFileRoute } from '@tanstack/react-router'
import { useProducts } from "@/hooks/product.ts";
import type { ProductItemProps } from "@/routes/user/_pathlessLayout/admin/-components/product-item.tsx";
import Button from '@/components/button/button';
import { ShoppingBag } from 'lucide-react';
import { useShoppingCart } from '@/hooks/shopping-cart';
import { useState } from 'react';
import ProductModal from './-components/product-modal';

export const Route = createFileRoute('/products/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [isOpen, setOpen] = useState<boolean>(false);

    const { products } = useProducts();
    const { addToShoppingCart } = useShoppingCart();

    return (
        <div>
            {products.map((product: ProductItemProps) => (
                <div className='border border-gray-300 rounded-md overflow-hidden'>
                    {/* Product Header */}
                    <div className='flex items-center justify-between p-2'>
                        <p>{product.name}</p>
                        <div>
                            <Button size='sm' variant='secondary' className='aspect-square' onClick={() => {
                                setOpen(true);
                            }}>
                                <ShoppingBag className='size-4' />
                            </Button>
                        </div>
                    </div>

                    {isOpen && (
                        <ProductModal product={product} setOpen={setOpen} />
                    )}
                </div>
            ))}
        </div>
    )
}
