import { createOrderAction } from "@/data/orders";
import { addToShoppingCartAction, deleteShoppingCartAction, getShoppingCart, type ShoppingCartItem } from "@/data/shopping-cart";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useShoppingCart = () => {
    const { data: session } = authClient.useSession();
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

    /*  */
    const checkoutMutation = useMutation({
        mutationFn: (products: ShoppingCartItem[]) => createOrderAction(products),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['cart'],
        })
    });

    const handleCheckout = useCallback(
        (products: ShoppingCartItem[]) => {
            if (!session || !session.user) {
                alert("Du bist nicht angemeldet!");
                return;
            }

            if (!session.user.emailVerified) {
                alert("Du musst zuerst deine E-Mail verifizieren!");
                return;
            }

            if (products.length <= 0) {
                alert("Es konnten keine Produkte in deinem Warenkorb gefunden werden!");
                return;
            }


            checkoutMutation.mutate(products);
        },
        [checkoutMutation.mutate, session]
    )

    const deleteMutation = useMutation({
        mutationFn: deleteShoppingCartAction,
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['cart'],
        }),
    });

    return {
        shoppingCart,
        isPending,
        error,

        addToShoppingCart: createMutation.mutateAsync,
        isAddingToShoppingCart: createMutation.isPending,

        clearCart: deleteMutation.mutate,
        isClearingCart: deleteMutation.isPending,

        handleCheckout,
        isProcessing: checkoutMutation.isPending
    };
}