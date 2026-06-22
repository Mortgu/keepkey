import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateContractInput, UpdateContractInput } from "@/types";
import {
  createContractAction,
  deleteContractAction,
  getContractsAction,
  updateContractAction,
} from "@/data/contracts.ts";

export const useContractHook = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["contracts"] });

  const { data: contracts = [], isPending, error } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContractsAction,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateContractInput) => createContractAction(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContractInput }) =>
      updateContractAction(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContractAction(id),
    onSuccess: invalidate,
  });

  return {
    contracts,
    isPending,
    error,

    createContract: createMutation.mutateAsync,
    updateContract: updateMutation.mutateAsync,
    deleteContract: deleteMutation.mutate,

    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
