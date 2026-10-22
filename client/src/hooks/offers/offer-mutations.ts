import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createOffer,
    deleteOffer,
    extendOffer,
    generateOfferDocument,
    renewOffer,
    updateOffer
} from "./offer-api";
import { useOffers } from "./offer-hooks";
import { offerKeys } from "./offers-keys";

import type {
    CreateOfferInput,
    ExtendOfferInput,
    OfferFilterParams,
    UpdateOfferInput,
} from '@keepit/schemas';

export function useCreateOffer() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (input: CreateOfferInput) => createOffer(input),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: offerKeys.lists()
        }),
    });

    return {
        createOffer: mutation.mutateAsync,
        isCreatingOffer: mutation.isPending,
        errorCreatingOffer: mutation.error,
    }
}

export function useUpdateOffer() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ offerId, input }: {
            offerId: string, input: UpdateOfferInput,
        }) => updateOffer(offerId, input),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(args.offerId) });
        },
    });

    return {
        updateOffer: mutation.mutateAsync,
        isUpdatingOffer: mutation.isPending,
        errorUpdatingOffer: mutation.error,
    }
}

export function useDeleteOffer() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id }: { id: string }) => deleteOffer(id),
        onSettled: (_, __, { id }) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(id) });
        },
    });

    return {
        deleteOffer: mutation.mutate,
        isDeletingOffer: mutation.isPending,
        errorDeletingOffer: mutation.error,
    }
}

export function useOfferManager(filters: OfferFilterParams = {}) {
    const offerQuery = useOffers(filters);

    const createOfferMutation = useCreateOffer();
    const updateOfferMutation = useUpdateOffer();
    const deleteOfferMutation = useDeleteOffer();

    return {
        ...offerQuery,
        ...createOfferMutation,
        ...updateOfferMutation,
        ...deleteOfferMutation,
    }
}

export function useGenerateOfferDocument() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ offerId }: {
            offerId: string
        }) => generateOfferDocument(offerId),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(args.offerId) });
        },
    });

    return {
        generateOfferDocument: mutation.mutateAsync,
        isGenerating: mutation.isPending,
        errorGenerating: mutation.error,
    }
}

export function useRenewOffer() {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: ({ offerId, input }: { offerId: string; input: CreateOfferInput }) =>
            renewOffer(offerId, input),
        onSuccess: (_data, { offerId }) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(offerId) });
        }
    });
    return { renewOffer: mutation.mutateAsync, isRenewing: mutation.isPending, errorRenewing: mutation.error };
}

export function useExtendOffer() {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: ({ offerId, input }: { offerId: string; input: ExtendOfferInput }) =>
            extendOffer(offerId, input),
        onSuccess: (_data, { offerId }) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(offerId) });
        }
    });
    return { extendOffer: mutation.mutateAsync, isExtending: mutation.isPending, errorExtending: mutation.error };
}