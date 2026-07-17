import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderKeys } from "./orders/order-keys";
import type { CreateOrderInput, UpdateOrderInput } from "@/data/orders";
import { createOrderAction, deleteOrderAction, generateOrderDocumentAction, getNextOrderNumberAction, getOrdersAction, restoreOrderRevisionAction, updateOrderAction } from "@/data/orders";

export const useOrderHook = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orderKeys.all });

  const { data: orders = [], isPending, error } = useQuery({
    queryKey: orderKeys.list(),
    queryFn: getOrdersAction,
  });

  const { data: nextOrderNumber } = useQuery({
    queryKey: orderKeys.nextNumber(),
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

  const updateMutation = useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: UpdateOrderInput }) =>
      updateOrderAction(orderId, input),
    onSuccess: invalidate,
  });

  const restoreMutation = useMutation({
    mutationFn: ({ orderId, revisionId, expectedVersion }: {
      orderId: string;
      revisionId: string;
      expectedVersion: number;
    }) => restoreOrderRevisionAction(orderId, revisionId, expectedVersion),
    onSuccess: (_, args) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: orderKeys.revisions(args.orderId) });
    },
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

    updateOrder: updateMutation.mutateAsync,
    isUpdatingOrder: updateMutation.isPending,
    errorUpdatingOrder: updateMutation.error,

    restoreOrderRevision: restoreMutation.mutateAsync,
    isRestoringRevision: restoreMutation.isPending,
    restoringRevisionId: restoreMutation.variables?.revisionId,
    errorRestoringRevision: restoreMutation.error,

  };
};
