import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFlatRateAction, deleteFlatRateAction, getFlatRatesAction, updateFlatRateAction } from "@/data/flatrates";
import type { FlatRateBase, FlatRate } from "@/data/types";

export const useFlatRates = () => {
    const queryClient = useQueryClient();

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['flatrates'] });

    const { data: flatrates = [], isPending, error } = useQuery({
        queryKey: ['flatrates'],
        queryFn: getFlatRatesAction,
    });

    const createMutation = useMutation({
        mutationFn: (flatrate: FlatRateBase) => createFlatRateAction(flatrate),
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, flatrate }: { id: string; flatrate: Partial<FlatRateBase> }) =>
            updateFlatRateAction(id, flatrate),
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteFlatRateAction(id),
        onSuccess: invalidate,
    });

    return {
        flatrates,
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
