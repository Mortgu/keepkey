import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createContract, deleteContract, reorderContracts, updateContract } from "./contract-api";
import { contractKeys } from "./contract-keys";
import type { Contract, CreateContractInput } from '@keepit/schemas';
import { showToast } from "@/components/toast";

export function useCreateContract() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ input }: {
            input: CreateContractInput,
        }) => createContract(input),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: contractKeys.lists(),
        }),
    });

    return {
        createContract: mutation.mutateAsync,
        isCreatingContract: mutation.isPending,
        errorCreatingContract: mutation.error,
    }
}

export function useUpdateContract() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, input }: {
            id: string, input: CreateContractInput,
        }) => updateContract(id, input),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: contractKeys.lists(),
        }),
    });

    return {
        updateContract: mutation.mutateAsync,
        isUpdatingContract: mutation.isPending,
        errorUpdatingContract: mutation.error,
    }
}

export function useDeleteContract() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id }: { id: string }) => deleteContract(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: contractKeys.lists(),
        }),
    });

    return {
        deleteContract: mutation.mutateAsync,
        isDeletingContract: mutation.isPending,
        errorDeletingContract: mutation.error,
    }
}

/**
 * Speichert eine neue Tarif-Reihenfolge. Optimistisch: Die Liste springt sofort
 * um und wird bei einem Fehler auf den vorherigen Stand zurückgesetzt.
 */
export function useReorderContracts() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (ordered: Array<Contract>) =>
            reorderContracts({ ids: ordered.map((contract) => contract.id) }),
        onMutate: async (ordered) => {
            await queryClient.cancelQueries({ queryKey: contractKeys.lists() });
            const previous = queryClient.getQueryData<Array<Contract>>(contractKeys.lists());
            queryClient.setQueryData(contractKeys.lists(), ordered);
            return { previous };
        },
        onError: (error, _, context) => {
            queryClient.setQueryData(contractKeys.lists(), context?.previous);
            showToast.error("", { message: error.message });
        },
        onSettled: () => queryClient.invalidateQueries({
            queryKey: contractKeys.lists(),
        }),
    });

    return {
        reorderContracts: mutation.mutate,
        isReorderingContracts: mutation.isPending,
    }
}

export function useContractManager() {
    const createMutation = useCreateContract();
    const updateMutation = useUpdateContract();
    const deleteMutation = useDeleteContract();

    return {
        ...createMutation,
        ...updateMutation,
        ...deleteMutation,
    }
}