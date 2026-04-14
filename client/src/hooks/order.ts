import { deleteOrderAction, getAllOrdersAction, getOrdersAction, startGeneration } from "@/data/orders";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface UseOrdersOptions {
    adminMode?: boolean;
};

export const useOrders = (options: UseOrdersOptions = {}) => {
    const { adminMode = false } = options;
    const queryClient = useQueryClient();

    const queryKey = adminMode ? ['admin:orders'] : ['orders'];

    const { data: orders = [], isPending, error } = useQuery({
        queryKey: queryKey,
        queryFn: adminMode ? getAllOrdersAction : getOrdersAction,
    });

    const deleteMutation = useMutation({
        mutationFn: (orderId: string) => deleteOrderAction(orderId),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: queryKey,
        }),
    });

    const generateMutation = useMutation({
        mutationFn: ({ orderId }: { orderId: string }) => startGeneration(orderId),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: queryKey,
        }),
    })

    return {
        orders,
        isPending,
        error,

        deleteOrder: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,

        generate: generateMutation.mutate,
        isGenerating: generateMutation.isPending,
    }
}