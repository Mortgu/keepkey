import { createOrderAction } from "@/data/orders";
import { addToShoppingCartAction, getShoppingCart } from "@/data/shopping-cart";
import type { ProductItemProps } from "@/routes/user/_pathlessLayout/admin/-components/product-item";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useShoppingCart = () => {
    const queryClient = useQueryClient();

    const { data: shoppingCart = [], isPending, error } = useQuery({
        queryKey: ['cart'],
        queryFn: getShoppingCart,
    });

    const createMutation = useMutation({
        mutationFn: addToShoppingCartAction,
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['cart'],
        }),
    });

    const checkoutMutation = useMutation({
        mutationFn: (products: ProductItemProps[]) => createOrderAction(products),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['orders', 'cart'],
        })
    })

    return {
        shoppingCart,
        isPending,
        error,

        addToShoppingCart: createMutation.mutateAsync,
        isAddingToShoppingCart: createMutation.isPending,

        checkout: checkoutMutation.mutate,
        isProcessing: checkoutMutation.isPending
    };
}