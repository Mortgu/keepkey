import type { OfferProductInput } from "@/routes/_main/offers/-components/modal-components/offer-product-form";
import { useQuery } from "@tanstack/react-query";
import { productQueries } from "./product-queries";

const EMPTY_ARRAY: never[] = [];

export function useProducts() {
    const { data = EMPTY_ARRAY, isPending, error } = useQuery(productQueries.list());
    return { products: data, isPending, error };
}

export function useProduct(id: string) {
    const { data, isPending, error } = useQuery(productQueries.detail(id));
    return { product: data, isPending, error };
}

export function usePrice(customerId: string, workload: OfferProductInput) {
    console.log("hook: ", customerId, workload)
    const { data, isPending, error } = useQuery(productQueries.price(customerId, workload));
    return { price: data, isPending, error };
}