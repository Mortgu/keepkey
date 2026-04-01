import { createCheckoutAction } from "@/data/orders";
import { addToShoppingCartAction, removeFromShoppingCartAction, deleteShoppingCartAction, getShoppingCart } from "@/data/shopping-cart";
import type { ShoppingCartItem } from "@/data/types";
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

    const removeMutation = useMutation({
        mutationFn: removeFromShoppingCartAction,
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['cart'],
        }),
    })


    /* Checkout */
    const checkoutMutation = useMutation({
        mutationFn: createCheckoutAction,
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


            checkoutMutation.mutate();
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

        removeFromShoppingCart: removeMutation.mutateAsync,
        isRemovingFromShoppingCart: removeMutation.isPending,

        clearCart: deleteMutation.mutate,
        isClearingCart: deleteMutation.isPending,

        handleCheckout,
        isProcessing: checkoutMutation.isPending,
        checkoutData: checkoutMutation.data,
        checkoutErrors: checkoutMutation.error,
    };
}