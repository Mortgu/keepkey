import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/data/products.ts";

export const useProducts = () => {
    const { data: products = [], isPending, error } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    return {
        products,
        isPending,
        error,
    };
}