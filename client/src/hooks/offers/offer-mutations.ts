import type { CreateOfferFlatrateInput, CreateOfferInput, CreateOfferPositionInput, Offer, OfferFilters, UpdateOfferFlatrateInput, UpdateOfferInput, UpdateOfferPositionInput } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOffer, createOfferFlatrates, createOfferPositions, deleteOffer, deleteOfferDocument, deleteOfferFlatrate, deleteOfferPosition, deleteOfferRevision, generateOfferDocument, updateOffer, updateOfferFlatrate, updateOfferPosition, uploadOfferDocument } from "./offer-api";
import { useOffers } from "./offer-hooks";
import { offerKeys } from "./offers-keys";

export function useCreateOffer() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ offer, positions, flatrates }: {
            offer: CreateOfferInput,
            positions: Array<CreateOfferPositionInput>,
            flatrates: Array<CreateOfferFlatrateInput>,
        }) => createOffer(offer, positions, flatrates),
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
        mutationFn: ({ offerId, offer, positions, flatrates }: {
            offerId: string, offer: UpdateOfferInput, positions: Array<UpdateOfferPositionInput>, flatrates: Array<UpdateOfferFlatrateInput>
        }) => updateOffer(offerId, offer, positions, flatrates),
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
        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey: offerKeys.lists() });

            const previous = queryClient.getQueriesData<Array<Offer>>({
                queryKey: offerKeys.lists(),
            });

            queryClient.setQueriesData<Array<Offer>>(
                { queryKey: offerKeys.lists() },
                (old) => old?.filter((offer) => offer.id !== id),
            );

            return { previous };
        },
        onError: (_err, _vars, context) => {
            context?.previous.forEach(([key, data]) => {
                queryClient.setQueryData(key, data);
            });
        },
        onSettled: (_, __, { id }) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(id) });
        },
    });

    return {
        deleteOffer: mutation.mutateAsync,
        isDeletingOffer: mutation.isPending,
        errorDeletingOffer: mutation.error,
    }
}

export function useCreateOfferPositions() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, input }: {
            id: string, input: Array<CreateOfferPositionInput>
        }) => createOfferPositions(id, input),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(args.id) });
        },
    });

    return {
        createOfferPositions: mutation.mutateAsync,
        isCreatingOfferPositions: mutation.isPending,
        errorCreatingOfferPositions: mutation.error,
    }
}

export function useUpdateOfferPosition() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, positionId, input }: {
            id: string, positionId: string, input: UpdateOfferPositionInput
        }) => updateOfferPosition(id, positionId, input),
        onSuccess: (position) => queryClient.invalidateQueries({
            queryKey: offerKeys.detail(position.offerId)
        }),
    });

    return {
        updateOfferPosition: mutation.mutateAsync,
        isUpdatingOfferPosition: mutation.isPending,
        errorUpdatingOfferPosition: mutation.error,
    }
}

export function useDeleteOfferPosition() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, positionId }: {
            id: string, positionId: string
        }) => deleteOfferPosition(id, positionId),
        onSuccess: (position) => queryClient.invalidateQueries({
            queryKey: offerKeys.detail(position.offerId)
        }),
    });

    return {
        deleteOfferPosition: mutation.mutateAsync,
        isDeletingOfferPosition: mutation.isPending,
        errorDeletingOfferPosition: mutation.error,
    }
}

export function useCreateOfferFlatrates() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, input }: {
            id: string, input: Array<CreateOfferFlatrateInput>
        }) => createOfferFlatrates(id, input),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(args.id) });
        },
    });

    return {
        createOfferFlatrates: mutation.mutateAsync,
        isCreatingOfferFlatrates: mutation.isPending,
        errorCreatingOfferFlatrates: mutation.error,
    }
}

export function useUpdateOfferFlatrate() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, flatrateId, input }: {
            id: string, flatrateId: string, input: UpdateOfferFlatrateInput
        }) => updateOfferFlatrate(id, flatrateId, input),
        onSuccess: (position) => queryClient.invalidateQueries({
            queryKey: offerKeys.detail(position.offerId)
        }),
    });

    return {
        createOfferFlatrate: mutation.mutateAsync,
        isCreatingOfferFlatrate: mutation.isPending,
        errorCreatingOfferFlatrate: mutation.error,
    }
}

export function useDeleteOfferFlatrate() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, flatrateId }: {
            id: string, flatrateId: string
        }) => deleteOfferFlatrate(id, flatrateId),
        onSuccess: (position) => queryClient.invalidateQueries({
            queryKey: offerKeys.detail(position.offerId)
        }),
    });

    return {
        deleteOfferFlatrate: mutation.mutateAsync,
        isDeletingOfferFlatrate: mutation.isPending,
        errorDeletingOfferFlatrate: mutation.error,
    }
}

export function useOfferManager(filters: OfferFilters = {}) {
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

export function useOfferDocumentUpload() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ offerId, documentId }: {
            offerId: string, documentId: string
        }) => uploadOfferDocument(offerId, documentId),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(args.offerId) });
        },
    });

    return {
        uploadOfferDocument: mutation.mutateAsync,
        isUploading: mutation.isPending,
        errorUploading: mutation.error,
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

export function useDeleteOfferDocument() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ offerId, documentId }: {
            offerId: string, documentId: string
        }) => deleteOfferDocument(offerId, documentId),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(args.offerId) });
        },
    });

    return {
        deleteOfferDocument: mutation.mutateAsync,
        isDeleting: mutation.isPending,
        errorDeleting: mutation.error,
    }
}

export function useDeleteOfferRevision() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ offerId, revisionId }: {
            offerId: string, revisionId: string
        }) => deleteOfferRevision(offerId, revisionId),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(args.offerId) });
        },
    });

    return {
        deleteOfferRevision: mutation.mutateAsync,
        isDeletingRevision: mutation.isPending,
        errorDeletingRevision: mutation.error,
    }
}