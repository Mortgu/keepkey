import { createFileRoute } from '@tanstack/react-router'
import { useProducts } from "@/hooks/product.ts";
import ProductCard from './-components/product-card';
import type { ProductItem } from '@/data/types';

export const Route = createFileRoute('/_main/products/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { products } = useProducts();

    return (
        <div className='grid gap-4'>
            {products.map((product: ProductItem, index: number) => (
                <ProductCard key={index} product={product} />
            ))}
        </div>
    )
}
