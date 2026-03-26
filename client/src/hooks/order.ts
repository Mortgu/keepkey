import { deleteOrderAction, getOrdersAction } from "@/data/orders";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useOrders = () => {
    const queryClient = useQueryClient();

    const { data: orders = [], isPending, error } = useQuery({
        queryKey: ["orders"],
        queryFn: getOrdersAction,
    });

    const deleteMutation = useMutation({
        mutationFn: (orderId: string) => deleteOrderAction(orderId),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['orders'],
        }),
    })

    return {
        orders,
        isPending,
        error,

        deleteOrder: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    }
}