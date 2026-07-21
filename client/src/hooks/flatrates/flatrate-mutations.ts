import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateFlatRateInput, UpdateFlatRateInput } from "@/types";
import { createFlatRate, deleteFlatRate, updateFlatRate } from "./flatrate-api";
import { flatRateKeys } from "./flatrate-keys";
import { useFlatRates } from "./flatrate-hooks";

export function useCreateFlatRate() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (flatRate: CreateFlatRateInput) => createFlatRate(flatRate),
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
        mutationFn: ({ id, flatRate }: { id: string; flatRate: Partial<UpdateFlatRateInput> }) =>
            updateFlatRate(id, flatRate),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: flatRateKeys.lists() }),
    });

    return {
        updateFlatRate: mutation.mutate,
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
