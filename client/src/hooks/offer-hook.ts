import {
  createOfferAction,
  deleteOfferAction,
  deleteOfferDocumentAction,
  getOfferRevisionsAction,
  getOffersAction,
  getContactPersonsAction,
  updateOfferAction,
  renameDocumentAction,
  createReservationAction,
  uploadAction,
} from "@/data/offer";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CreateOfferPositionInput,
  CreateOfferInput,
  CreateOfferFlatRatesInput,
  UpdateOfferInput,
  UpdateOfferPositionInput,
  UpdateOfferFlatRatesInput,
} from "@/types";

interface OfferQueryParams {
  search?: string;
  companyIds?: string[];
  contactPersonIds?: string[];
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
      offer: CreateOfferInput; positions: CreateOfferPositionInput[]; flatRates: CreateOfferFlatRatesInput[];
    }) => createOfferAction(offer, positions, flatRates),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, offer, positions, flatRates }: {
      id: string, offer: UpdateOfferInput; positions: UpdateOfferPositionInput[]; flatRates: UpdateOfferFlatRatesInput[];
    }) => updateOfferAction(id, offer, positions, flatRates),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteOfferAction(id),
    onSuccess: invalidate,
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: ({ offerId, documentId }: { offerId: string; documentId: string }) =>
      deleteOfferDocumentAction(offerId, documentId),
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
    mutationFn: uploadAction,
  })

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

    createReservation: createReservationMutation.mutate,
    isCreatingReservation: createReservationMutation.isPending,
    errorCreatingReservation: createReservationMutation.error,

    upload: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    errorUploading: uploadMutation.error,
  };
};
