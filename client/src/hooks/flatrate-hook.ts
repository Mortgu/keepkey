import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateFlatRateInput,
  UpdateFlatRateInput
} from '@/types';
import {
  createFlatRateAction,
  deleteFlatRateAction,
  getFlatRatesAction,
  updateFlatRateAction,
} from "@/data/flatrates";


export const useFlatRateHook = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["flatrates"] });

  const {
    data: flatRates = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["flatrates"],
    queryFn: getFlatRatesAction,
  });

  const createMutation = useMutation({
    mutationFn: (flatrate: CreateFlatRateInput) => createFlatRateAction(flatrate),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      flatrate,
    }: {
      id: string;
      flatrate: UpdateFlatRateInput;
    }) => updateFlatRateAction(id, flatrate),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFlatRateAction(id),
    onSuccess: invalidate,
  });

  return {
    flatRates,
    isPending,
    error,

    createFlatRate: createMutation.mutateAsync,
    isCreatingFlatRate: createMutation.isPending,
    errorCreatingFlatRate: createMutation.error,

    updateFlatRate: updateMutation.mutate,
    isUpdatingFlatRate: updateMutation.isPending,
    errorUpdatingFlatRate: updateMutation.error,

    deleteFlatRate: deleteMutation.mutateAsync,
    isDeletingFlatRate: deleteMutation.isPending,
    errorDeletingFlatRate: deleteMutation.error,
  };
};
