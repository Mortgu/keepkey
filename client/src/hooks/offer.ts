import { createOfferAction, getOffersAction } from "@/data/offer";
import type { BaseOffer, Offer } from "@/data/types";
import type { OfferProductInput } from "@/routes/admin/_adminLayout/offers/-components/offer-product-form";
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
    })

    return {
        offers,
        isPending,
        error,

        createOffer: createMutation.mutateAsync,
        isCreatingOffer: createMutation.isPaused,
        errorCreatingOffer: createMutation.error
    }
}