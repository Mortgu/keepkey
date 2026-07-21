import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateProductInput } from "@/types";
import { createProduct, deleteProduct, updateProduct } from "./product-api";
import { productKeys } from "./product-keys";
import { useProducts } from "./product-hooks";

export function useCreateProduct() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
    });

    return {
        createProduct: mutation.mutateAsync,
        isCreatingProduct: mutation.isPending,
        errorCreatingProduct: mutation.error,
    };
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, product }: { id: string; product: UpdateProductInput }) =>
            updateProduct(id, product),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
    });

    return {
        updateProduct: mutation.mutate,
        isUpdatingProduct: mutation.isPending,
        errorUpdatingProduct: mutation.error,
    };
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
    });

    return {
        deleteProduct: mutation.mutateAsync,
        isDeletingProduct: mutation.isPending,
        errorDeletingProduct: mutation.error,
    };
}

export function useProductManager() {
    const productsQuery = useProducts();
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();
    const deleteMutation = useDeleteProduct();

    return {
        ...productsQuery,
        ...createMutation,
        ...updateMutation,
        ...deleteMutation,
    };
}
