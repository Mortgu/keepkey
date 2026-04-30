import { deleteOrderAction, getOrdersAction } from "@/data/orders";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useOrders = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["orders"] });

  const {
    data: orders = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrdersAction,
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => deleteOrderAction(orderId),
    onSuccess: invalidate,
  });

  return {
    orders,
    isPending,
    error,

    deleteOrder: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
