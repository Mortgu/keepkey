import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateSupplierInput, UpdateSupplierInput } from "@/types";
import { createSupplier, deleteSupplier, updateSupplier } from "./supplier-api";
import { supplierKeys } from "./supplier-keys";
import { useSuppliers } from "./supplier-hooks";

export function useCreateSupplier() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (supplier: CreateSupplierInput) => createSupplier(supplier),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.lists() }),
    });

    return {
        createSupplier: mutation.mutateAsync,
        isCreatingSupplier: mutation.isPending,
        errorCreatingSupplier: mutation.error,
    };
}

export function useUpdateSupplier() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, supplier }: { id: string; supplier: UpdateSupplierInput }) =>
            updateSupplier(id, supplier),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.lists() }),
    });

    return {
        updateSupplier: mutation.mutate,
        isUpdatingSupplier: mutation.isPending,
        errorUpdatingSupplier: mutation.error,
    };
}

export function useDeleteSupplier() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: deleteSupplier,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: supplierKeys.lists() }),
    });

    return {
        deleteSupplier: mutation.mutate,
        isDeletingSupplier: mutation.isPending,
        errorDeletingSupplier: mutation.error,
    };
}

export function useSupplierManager() {
    const suppliersQuery = useSuppliers();
    const createMutation = useCreateSupplier();
    const updateMutation = useUpdateSupplier();
    const deleteMutation = useDeleteSupplier();

    return {
        ...suppliersQuery,
        ...createMutation,
        ...updateMutation,
        ...deleteMutation,
    };
}
