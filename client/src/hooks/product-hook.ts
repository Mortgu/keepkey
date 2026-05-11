import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPricingAction,
  createProductAction,
  deletePricingAction,
  deleteProductAction,
  getProductsAction,
  updatePricingAction,
  updateProductAction,
} from "@/data/products.ts";
import type { Product, CreateProductPricingInput, UpdateProductPricingInput } from "@/types";

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

  const createPricingMutation = useMutation({
    mutationFn: ({
      productId,
      pricing,
    }: {
      productId: string;
      pricing: CreateProductPricingInput;
    }) => createPricingAction(productId, pricing),
    onSuccess: invalidate,
  });

  const updatePricingMutation = useMutation({
    mutationFn: ({ id, pricing }: { id: string; pricing: UpdateProductPricingInput }) =>
      updatePricingAction(id, pricing),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, product }: { id: string; product: Partial<Product> }) =>
      updateProductAction(id, product),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProductAction(id),
    onSuccess: invalidate,
  });

  const deletePricingMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deletePricingAction(id),
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

    createPricing: createPricingMutation.mutateAsync,
    isCreatingPricing: createPricingMutation.isPending,
    errorCreatingPricing: createPricingMutation.error,

    updatePricing: updatePricingMutation.mutateAsync,
    isUpdatingPricing: updatePricingMutation.isPending,
    errorUpdatingPricing: updatePricingMutation.error,

    deletePricing: deletePricingMutation.mutate,
    isDeletingPricing: deletePricingMutation.isPending,
    errorDeletingPricing: deletePricingMutation.error,
  };
};
