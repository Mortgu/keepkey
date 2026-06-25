import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateContractInput } from '@/types';
import { createContract, deleteContract, updateContract } from "./contract-api";
import { contractKeys } from "./contract-keys";

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