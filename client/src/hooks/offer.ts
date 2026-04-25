import { createOfferAction, deleteOfferAction, getOffersAction } from "@/data/offer";
import type { BaseOffer, Offer } from "@/data/types";
import type { OfferProductInput } from "@/routes/_main/offers/-components/offer-product-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useOffer = () => {
    const queryClient = useQueryClient();
    const queryKey = ['offers'];

    const { data: offers = [], isPending, error } = useQuery({
        queryKey: queryKey,
        queryFn: getOffersAction,
    });

    const createMutation = useMutation({
        mutationFn: ({ offer, positions }: { offer: BaseOffer, positions: OfferProductInput[] }) => createOfferAction(offer, positions),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: queryKey
        })
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string }) => deleteOfferAction(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: queryKey
        })
    })

    return {
        offers,
        isPending,
        error,

        createOffer: createMutation.mutateAsync,
        isCreatingOffer: createMutation.isPaused,
        errorCreatingOffer: createMutation.error,

        deleteOffer: deleteMutation.mutate,
        isDeletingOffer: deleteMutation.isPending,
        errorDeletingOffer: deleteMutation.error,
    }
}