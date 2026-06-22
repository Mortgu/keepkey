import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateSupplierInput, UpdateSupplierInput } from "@/types";
import {
  UpdateSupplierAction,
  createSupplierAction,
  deleteSupplierAction,
  getSuppliersAction,
} from "@/data/supplier";

export const useSupplierHook = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["suppliers"] });

  const { data: suppliers = [], isPending, error } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliersAction,
  });

  const createMutation = useMutation({
    mutationFn: (supplier: CreateSupplierInput) =>
      createSupplierAction(supplier),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, supplier }: { id: string, supplier: UpdateSupplierInput }) =>
      UpdateSupplierAction(id, supplier),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSupplierAction(id),
    onSuccess: invalidate,
  });

  return {
    suppliers,
    isPending,
    error,

    createSupplier: createMutation.mutateAsync,
    isCreatingSupplier: createMutation.isPending,
    errorCreatingSupplier: createMutation.error,

    deleteSupplier: deleteMutation.mutate,
    isDeletingSupplier: deleteMutation.isPending,
    errorDeletingSupplier: deleteMutation.error,

    updateSupplier: updateMutation.mutate,
    isUpdatingSupplier: updateMutation.isPending,
    errorUpdateingSupplier: updateMutation.error,
  };
};
