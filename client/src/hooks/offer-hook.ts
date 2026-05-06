import {
  createOfferAction,
  deleteOfferAction,
  getOffersAction,
  updateOfferAction,
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


export const useOfferHook = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["offers"] });

  const { data: offers = [], isPending, error } = useQuery({
    queryKey: ["offers"],
    queryFn: getOffersAction,
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

    updateOffer: updateMutation.mutateAsync,
    isUpdatingOffer: updateMutation.isPending,
    errorUpdatingOffer: updateMutation.error,
  };
};
