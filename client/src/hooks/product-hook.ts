import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpdateProductInput } from "@/types";
import {
  createProductAction,
  deleteProductAction,
  getProductAction,
  getProductsAction,
  updateProductAction,
} from "@/data/products.ts";

export const useProductHook = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["products"] });

  const {
    data: products = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProductsAction,
  });

  const createMutation = useMutation({
    mutationFn: createProductAction,
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, product }: { id: string; product: UpdateProductInput }) =>
      updateProductAction(id, product),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProductAction(id),
    onSuccess: invalidate,
  });

  return {
    products,
    isPending,
    error,

    createProduct: createMutation.mutateAsync,
    isCreatingProduct: createMutation.isPending,
    errorCreatingProduct: createMutation.error,

    updateProduct: updateMutation.mutate,
    isUpdatingProduct: updateMutation.isPending,
    errorUpdatingProduct: updateMutation.error,

    deleteProduct: deleteMutation.mutateAsync,
    isDeletingProduct: deleteMutation.isPending,
    errorDeletingProduct: deleteMutation.error,
  };
};
