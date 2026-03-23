import { createOrderAction, getOrdersAction } from "@/data/orders";
import type { ProductItemProps } from "@/routes/user/_pathlessLayout/admin/-components/product-item";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useOrders = () => {
    const queryClient = useQueryClient();

    const { data: orders = [], isPending, error } = useQuery({
        queryKey: ["orders"],
        queryFn: getOrdersAction,
    });

    const createMutation = useMutation({
        mutationFn: ({ products }: {
            products: ProductItemProps[]
        }) =>
            createOrderAction(products),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['orders']
        })

    })

    return {
        orders,
        isPending,
        error,

        createOrder: createMutation.mutateAsync,

        isCreating: createMutation.isPending,
    }
}