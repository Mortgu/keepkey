import type { BaseContract } from "@/data/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContractAction,
  deleteContractAction,
  getContractsAction,
  updateContractAction,
} from "@/data/contracts.ts";

export const useContracts = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["contracts"] });

  const {
    data: contracts = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContractsAction,
  });

  const createMutation = useMutation({
    mutationFn: (data: BaseContract) => createContractAction(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BaseContract }) =>
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
