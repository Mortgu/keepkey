import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateOrderInput } from "@/data/orders";
import { createOrderAction, deleteOrderAction, generateOrderDocumentAction, getNextOrderNumberAction, getOrdersAction } from "@/data/orders";

export const useOrderHook = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["orders"] });

  const { data: orders = [], isPending, error } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrdersAction,
  });

  const { data: nextOrderNumber } = useQuery({
    queryKey: ["orders", "next-number"],
    queryFn: getNextOrderNumberAction,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateOrderInput) => createOrderAction(input),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => deleteOrderAction(orderId),
    onSuccess: invalidate,
  });

  const generateDocumentMutation = useMutation({
    mutationFn: ({ orderId }: { orderId: string }) => generateOrderDocumentAction(orderId),
    onSuccess: invalidate,
  });

  return {
    orders,
    isPending,
    error,

    nextOrderNumber: nextOrderNumber?.orderId,

    createOrder: createMutation.mutateAsync,
    isCreatingOrder: createMutation.isPending,
    errorCreatingOrder: createMutation.error,

    deleteOrder: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    errorDeletingOrder: deleteMutation.error,

    generateDocument: generateDocumentMutation.mutate,
    isGeneratingDocument: generateDocumentMutation.isPending,
  };
};
