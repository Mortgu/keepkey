import { useEffect } from "react";
import {  useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {QueryClient} from "@tanstack/react-query";
import type {
    CreateOfferFlatRatesInput,
    CreateOfferInput,
    CreateOfferPositionInput,
    DocumentStatus,
    Offer,
    Order,
    UpdateOfferFlatRatesInput,
    UpdateOfferInput,
    UpdateOfferPositionInput,
} from "@/types";

import {
    createOfferAction,
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

function updateOfferDocumentStatus(
    queryClient: QueryClient,
    taskId: string,
    status: DocumentStatus,
    error?: string,
) {
    queryClient.setQueriesData<Array<Offer>>({ queryKey: ["offers"] }, (offers) => {
        if (!offers) return offers;
        return offers.map((offer) => ({
            ...offer,
            offerDocuments: offer.offerDocuments.map((doc) =>
                doc.taskId === taskId
                    ? { ...doc, status, ...(error ? { error } : {}) }
                    : doc
            ),
        }));
    });
}

function updateOrderDocumentStatus(
    queryClient: QueryClient,
    taskId: string,
    status: DocumentStatus,
    error?: string,
) {
    queryClient.setQueriesData<Array<Order>>({ queryKey: ["orders"] }, (orders) => {
        if (!orders) return orders;
        return orders.map((order) => ({
            ...order,
            documents: order.documents.map((doc) =>
                doc.taskId === taskId
                    ? { ...doc, status, ...(error ? { error } : {}) }
                    : doc
            ),
        }));
    });
}

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
        if (!task || !taskId) return;

        if (task.status === "COMPLETED") {
            updateOfferDocumentStatus(queryClient, taskId, "GENERATED");
            updateOrderDocumentStatus(queryClient, taskId, "GENERATED");
            queryClient.invalidateQueries({ queryKey: ["offers"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        }

        if (task.status === "FAILED") {
            updateOfferDocumentStatus(queryClient, taskId, "FAILED", task.error ?? undefined);
            updateOrderDocumentStatus(queryClient, taskId, "FAILED", task.error ?? undefined);
        }
    }, [task?.status, taskId, queryClient]);

    return { task };
};

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
        mutationFn: ({ offerId, documentId }: { offerId: string, documentId: string }) =>
            deleteOfferDocumentAction(offerId, documentId),
        onSuccess: invalidate,
    });

    const renameDocumentMutation = useMutation({
        mutationFn: ({ document_id, displayName }: { document_id: string, displayName: string }) =>
            renameDocumentAction(document_id, displayName),
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

        upload: uploadMutation.mutateAsync,
        isUploading: uploadMutation.isPending,
        errorUploading: uploadMutation.error,

        generateDocument: generateDocumentMutation.mutate,
        isGeneratingDocument: generateDocumentMutation.isPending,
    };
};
