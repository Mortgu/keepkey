import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
    CreateOfferFlatRatesInput,
    CreateOfferInput,
    CreateOfferPositionInput,
    UpdateOfferFlatRatesInput,
    UpdateOfferInput,
    UpdateOfferPositionInput,
} from "@/types";

import {
    createOfferAction,
    createReservationAction,
    deleteOfferAction,
    deleteOfferDocumentAction,
    generateOfferDocumentAction,
    getContactPersonsAction,
    getOfferRevisionsAction,
    getOffersAction,
    getTaskByIdAction,
    renameDocumentAction,
    updateOfferAction,
    uploadAction,
} from "@/data/offer";


interface OfferQueryParams {
    search?: string;
    companyIds?: Array<string>;
    contactPersonIds?: Array<string>;
    sort?: string;
}

export const useOfferRevisionsHook = (offerId: string) => {
    const { data: revisions = [] } = useQuery({
        queryKey: ["offers", offerId, "revisions"],
        queryFn: () => getOfferRevisionsAction(offerId),
        enabled: !!offerId,
    });

    return { revisions };
};

export const useDocumentTask = (taskId?: string) => {
    const queryClient = useQueryClient();

    const { data: task } = useQuery({
        queryKey: ["task", taskId],
        queryFn: () => getTaskByIdAction(taskId!),
        refetchInterval: (query) => {
            if (query.state.data?.status === "COMPLETED") {
                return false;
            }

            if (query.state.data?.status === "FAILED") {
                return false;
            }

            return 2000;
        },

        enabled: !!taskId,
    });

    useEffect(() => {
        if (task?.status === "COMPLETED") {
            queryClient.invalidateQueries({ queryKey: ["offers"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        }
    }, [task?.status, queryClient]);

    return { task };
};

export const useReservationTask = (taskId?: string) => useDocumentTask(taskId);

export const useOfferHook = (params?: OfferQueryParams) => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["offers"] });

    const { data: offers = [], isPending, error } = useQuery({
        queryKey: ["offers", params],
        queryFn: () => getOffersAction(params),
    });

    const { data: contactPersons = [] } = useQuery({
        queryKey: ["contact-persons"],
        queryFn: getContactPersonsAction,
    });

    const createMutation = useMutation({
        mutationFn: ({ offer, positions, flatRates }: {
            offer: CreateOfferInput; positions: Array<CreateOfferPositionInput>; flatRates: Array<CreateOfferFlatRatesInput>;
        }) => createOfferAction(offer, positions, flatRates),
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, offer, positions, flatRates }: {
            id: string,
            offer: UpdateOfferInput;
            positions: Array<UpdateOfferPositionInput>;
            flatRates: Array<UpdateOfferFlatRatesInput>;
        }) => updateOfferAction(id, offer, positions, flatRates),
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string }) => deleteOfferAction(id),
        onSuccess: invalidate,
    });

    const deleteDocumentMutation = useMutation({
        mutationFn: ({ documentId }: { documentId: string }) =>
            deleteOfferDocumentAction(documentId),
        onSuccess: invalidate,
    });

    const renameDocumentMutation = useMutation({
        mutationFn: ({ document_id, displayName }: { document_id: string, displayName: string }) =>
            renameDocumentAction(document_id, displayName),
        onSuccess: invalidate,
    });

    const createReservationMutation = useMutation({
        mutationFn: ({ offer_id }: { offer_id: string }) => createReservationAction(offer_id),
        onSuccess: invalidate,
    });

    const uploadMutation = useMutation({
        mutationFn: ({ offerId, documentId }: { offerId: string, documentId: string }) => uploadAction(offerId, documentId),
        onSuccess: invalidate
    });

    const generateDocumentMutation = useMutation({
        mutationFn: ({ offerId }: { offerId: string }) => generateOfferDocumentAction(offerId),
        onSuccess: invalidate,
    });

    return {
        offers,
        contactPersons,
        isPending,
        error,

        createOffer: createMutation.mutateAsync,
        isCreatingOffer: createMutation.isPaused,
        errorCreatingOffer: createMutation.error,

        deleteOffer: deleteMutation.mutate,
        isDeletingOffer: deleteMutation.isPending,
        errorDeletingOffer: deleteMutation.error,

        deleteDocument: deleteDocumentMutation.mutate,
        isDeletingDocument: deleteDocumentMutation.isPending,
        errorDeletingDocument: deleteDocumentMutation.error,

        updateOffer: updateMutation.mutateAsync,
        isUpdatingOffer: updateMutation.isPending,
        errorUpdatingOffer: updateMutation.error,

        renameDocument: renameDocumentMutation.mutateAsync,
        isRenamingDocument: renameDocumentMutation.isPending,
        errorRenamingDocument: renameDocumentMutation.error,

        createReservation: createReservationMutation.mutateAsync,
        isCreatingReservation: createReservationMutation.isPending,
        errorCreatingReservation: createReservationMutation.error,

        upload: uploadMutation.mutateAsync,
        isUploading: uploadMutation.isPending,
        errorUploading: uploadMutation.error,

        generateDocument: generateDocumentMutation.mutate,
        isGeneratingDocument: generateDocumentMutation.isPending,
    };
};
