import {createFileRoute} from '@tanstack/react-router'
import {useQuery} from "@tanstack/react-query";
import {getShoppingCart} from "@/data/shopping-cart.ts";
import {Loader} from "lucide-react";

export const Route = createFileRoute('/checkout/')({
    component: RouteComponent,
})

function RouteComponent() {
    const { data, isPending, error } = useQuery({
        queryKey: ["cartItems"],
        queryFn: getShoppingCart
    });

    if (isPending) {
        return <Loader className="animate-spin" />
    }

    if (error) {
        return (
            <p>Error: {error.message}</p>
        )
    }

    return (
        <div>
            {data.map((item: any) => (
                <div>
                    <p>{item.product.name}</p>
                    <div>
                        <p>{item.quantity}x</p>
                        <p>{item.product.price}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
