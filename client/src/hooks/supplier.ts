import {
  createSupplierAction,
  deleteSupplierAction,
  getSuppliersAction,
} from "@/data/supplier";
import type { BaseSupplier } from "@/data/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSupplier = () => {
  const queryClient = useQueryClient();

  const {
    data: suppliers = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliersAction,
  });

  const createMutation = useMutation({
    mutationFn: (supplier: BaseSupplier) => createSupplierAction(supplier),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupplierAction(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["suppliers"],
      }),
  });

  return {
    suppliers,
    isPending,
    error,

    createSupplier: createMutation.mutateAsync,
    deleteSupplier: deleteMutation.mutate,

    isCreatingSupplier: createMutation.isPending,
    isDeletingSupplier: deleteMutation.isPending,
  };
};
