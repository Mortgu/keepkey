import { addToShoppingCartAction, removeFromShoppingCartAction, deleteShoppingCartAction, getShoppingCart } from "@/data/shopping-cart";
import { authClient } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const useShoppingCart = () => {
    const { data: session } = authClient.useSession();
    const queryClient = useQueryClient();

    const { data: shoppingCart, isPending, error } = useQuery({
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
    };
}