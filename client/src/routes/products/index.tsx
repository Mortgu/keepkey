import {createFileRoute} from '@tanstack/react-router'
import {useProducts} from "@/hooks/product.ts";
import type {ProductItemProps} from "@/routes/user/_pathlessLayout/admin/-components/product-item.tsx";

export const Route = createFileRoute('/products/')({
    component: RouteComponent,
})

function RouteComponent() {
    const {products} = useProducts();

    return (
        <div>
            {products.map((product: ProductItemProps) => (
                <div>{product.name}</div>
            ))}
        </div>
    )
}
