import {
  createOfferAction,
  deleteOfferAction,
  getOffersAction,
} from "@/data/offer";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  CreateFlatRateInput,
  CreateOfferPositionInput,
  CreateOfferInput,
  CreateOfferFlatRatesInput,
} from "@/types";

export const useOffer = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["offers"] });

  const {
    data: offers = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["offers"],
    queryFn: getOffersAction,
  });

  const createMutation = useMutation({
    mutationFn: ({ offer, positions, flatRates }: {
      offer: CreateOfferInput; positions: CreateOfferPositionInput[]; flatRates: CreateOfferFlatRatesInput[];
    }) =>
      createOfferAction(offer, positions, flatRates),
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
  };
};
