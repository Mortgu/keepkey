import type { ProductItemProps } from "@/routes/user/_pathlessLayout/admin/-components/product-item.tsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProducts, createProductAction, deleteProductAction, updateProductAction } from "@/data/products.ts";
import { authClient } from "@/lib/auth-client";

export const useProducts = () => {
    const queryClient = useQueryClient();

    const { data: products = [], isPending, error } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    const createMutation = useMutation({
        mutationFn: createProductAction,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['products'],
            })
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteProductAction(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['products'],
            })
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, product }: { id: string; product: Partial<ProductItemProps> }) =>
            updateProductAction(id, product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    return {
        products,
        isPending,
        error,

        createProduct: createMutation.mutateAsync,
        deleteProduct: deleteMutation.mutate,
        updateProduct: updateMutation.mutate,

        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}