import {
  createSupplierAction,
  deleteSupplierAction,
  getSuppliersAction,
} from "@/data/supplier";
import type { CreateSupplierInput, UpdateSupplierInput } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSupplierHook = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["suppliers"] });

  const {
    data: suppliers = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliersAction,
  });

  const createMutation = useMutation({
    mutationFn: (supplier: CreateSupplierInput) =>
      createSupplierAction(supplier),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupplierAction(id),
    onSuccess: invalidate,
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
