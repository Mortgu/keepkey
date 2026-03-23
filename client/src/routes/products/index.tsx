import { createFileRoute } from '@tanstack/react-router'
import { useProducts } from "@/hooks/product.ts";
import type { ProductItemProps } from "@/routes/user/_pathlessLayout/admin/-components/product-item.tsx";
import Button from '@/components/button/button';
import { ShoppingBag } from 'lucide-react';
import { useShoppingCart } from '@/hooks/shopping-cart';

export const Route = createFileRoute('/products/')({
    component: RouteComponent,
})

function RouteComponent() {
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
                                addToShoppingCart(product);
                            }}>
                                <ShoppingBag className='size-4' />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
