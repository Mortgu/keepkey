import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFlatRate, deleteFlatRate, updateFlatRate } from "./flatrate-api";
import { flatRateKeys } from "./flatrate-keys";
import { useFlatRates } from "./flatrate-hooks";

import type {
    CreateFlatrateInput,
    UpdateFlatrateInput,
} from "@keepit/schemas";

export function useCreateFlatRate() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (flatRate: CreateFlatrateInput) => createFlatRate(flatRate),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: flatRateKeys.lists() }),
    });

    return {
        createFlatRate: mutation.mutateAsync,
        isCreatingFlatRate: mutation.isPending,
        errorCreatingFlatRate: mutation.error,
    };
}

export function useUpdateFlatRate() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, flatRate }: { id: string; flatRate: Partial<UpdateFlatrateInput> }) =>
            updateFlatRate(id, flatRate),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: flatRateKeys.lists() }),
    });

    return {
        updateFlatRate: mutation.mutateAsync,
        isUpdatingFlatRate: mutation.isPending,
        errorUpdatingFlatRate: mutation.error,
    };
}

export function useDeleteFlatRate() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: deleteFlatRate,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: flatRateKeys.lists() }),
    });

    return {
        deleteFlatRate: mutation.mutateAsync,
        isDeletingFlatRate: mutation.isPending,
        errorDeletingFlatRate: mutation.error,
    };
}

export function useFlatRateManager() {
    const flatRatesQuery = useFlatRates();
    const createMutation = useCreateFlatRate();
    const updateMutation = useUpdateFlatRate();
    const deleteMutation = useDeleteFlatRate();

    return {
        ...flatRatesQuery,
        ...createMutation,
        ...updateMutation,
        ...deleteMutation,
    };
}
