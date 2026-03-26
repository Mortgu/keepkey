import { useQuery, useQueryClient } from "@tanstack/react-query"

export const useAdmin = () => {
    const queryClient = useQueryClient();

    const { data: orders = [], isPending: pendingOrders, error: errorOrders } = useQuery({
        queryKey: ['admin:orders'],
        queryFn: () => { },
    });

    return {
        orders,
        pendingOrders,
        errorOrders,
    }
}