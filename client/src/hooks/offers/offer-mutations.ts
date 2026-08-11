import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { createOffer, createOfferFlatrates, createOfferPositions, deleteOffer, deleteOfferFlatrate, deleteOfferPosition, extendOffer, generateOfferDocument, renewOffer, restoreOfferRevision, updateOffer, updateOfferFlatrate, updateOfferPosition } from "./offer-api";
import { useOffers } from "./offer-hooks";
import { offerKeys } from "./offers-keys";
import { ApiError } from "@/lib/api-client";

import type {
    CreateOfferFlatrateInput,
    CreateOfferInput,

    CreateOfferPositionInput,
    ExtendOfferInput,
    OfferFilterParams,

    UpdateOfferFlatrateInput,
    UpdateOfferInput,

    UpdateOfferPositionInput,
} from '@keepit/schemas';

/**
 * Nach einer verlorenen Belegnummer den Vorschlag verwerfen.
 *
 * Nummern werden nicht reserviert: zwei parallele Anlagen sehen denselben Vorschlag, der
 * zweite läuft in den Unique-Constraint. Der Cache muss dann weg, damit das Formular beim
 * nächsten Versuch die tatsächlich nächste freie Nummer bekommt statt der verbrannten.
 */
function invalidateQuoteIdSuggestionOnConflict(queryClient: QueryClient, error: unknown) {
    if (error instanceof ApiError && error.code === "QUOTE_ID_TAKEN") {
        queryClient.invalidateQueries({ queryKey: offerKeys.nextQuoteId() });
    }
}

export function useCreateOffer() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (input: CreateOfferInput) => createOffer(input),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: offerKeys.lists()
        }),
        onError: (error) => invalidateQuoteIdSuggestionOnConflict(queryClient, error),
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
        onError: (error) => invalidateQuoteIdSuggestionOnConflict(queryClient, error),
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

export function useRestoreOfferRevision() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ offerId, revisionId, expectedVersion }: {
            offerId: string, revisionId: string, expectedVersion: number
        }) => restoreOfferRevision(offerId, revisionId, expectedVersion),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: offerKeys.detail(args.offerId) });
            queryClient.invalidateQueries({ queryKey: offerKeys.revisions(args.offerId) });
        },
    });

    return {
        restoreOfferRevision: mutation.mutateAsync,
        isRestoringRevision: mutation.isPending,
        restoringRevisionId: mutation.variables?.revisionId,
        errorRestoringRevision: mutation.error,
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
        },
        onError: (error) => invalidateQuoteIdSuggestionOnConflict(queryClient, error),
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
        },
        onError: (error) => invalidateQuoteIdSuggestionOnConflict(queryClient, error),
    });
    return { extendOffer: mutation.mutateAsync, isExtending: mutation.isPending, errorExtending: mutation.error };
}