import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {createContractAction, deleteContractAction, getContractsAction} from "@/data/contracts.ts";

export const useContracts = () => {
    const queryClient = useQueryClient();

    const { data: contracts = [], isPending, error } = useQuery({
        queryKey: ['contracts'],
        queryFn: getContractsAction,
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => createContractAction(name),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['contracts'],
        }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteContractAction(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['contracts'],
        })
    })

    return {
        contracts,
        isPending,
        error,

        createContract: createMutation.mutateAsync,
        deleteContract: deleteMutation.mutate,

        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,
    }
}