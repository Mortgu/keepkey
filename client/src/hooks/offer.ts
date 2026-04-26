import {createOfferAction, deleteOfferAction, getOffersAction} from "@/data/offer";
import type {BaseOffer} from "@/data/types";
import type {OfferProductInput} from "@/routes/_main/offers/-components/offer-product-form";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

export const useOffer = () => {
    const queryClient = useQueryClient();

    const invalidate = () => queryClient.invalidateQueries({queryKey: ['offers']});

    const {data: offers = [], isPending, error} = useQuery({
        queryKey: ['offers'],
        queryFn: getOffersAction,
    });

    const createMutation = useMutation({
        mutationFn: ({offer, positions}: {
            offer: BaseOffer,
            positions: OfferProductInput[]
        }) => createOfferAction(offer, positions),
        onSuccess: invalidate
    });

    const deleteMutation = useMutation({
        mutationFn: ({id}: { id: string }) => deleteOfferAction(id),
        onSuccess: invalidate
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