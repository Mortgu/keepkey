import {getProducts} from "@/data/products.ts";
import {Loader} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import { Link } from '@tanstack/react-router'
import {useCart} from "@/context/shopping-cart.tsx";

type Product = {
    id: string;
    name: string;
}

export default function ProductList() {
    const { addToCart } = useCart();
    const { data, isPending, error } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    console.log(data, error);


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

    return data.map((product: Product) => (
        <div className="flex gap-4">
            <Link to="/products/$productId" params={{ productId: product.id }}>
                {product.name}
            </Link>
            <button onClick={() => addToCart({
                id: "1", name: "test", price: 12, quantity: 1,
            })}>add</button>
        </div>
    ));
}