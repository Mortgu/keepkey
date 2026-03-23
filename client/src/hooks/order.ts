import {getOrdersAction} from "@/data/orders";
import {useQuery, useQueryClient} from "@tanstack/react-query"

export const useOrders = () => {
    const queryClient = useQueryClient();

    const { data: orders = [], isPending, error } = useQuery({
        queryKey: ["orders"],
        queryFn: getOrdersAction,
    });

    return {
        orders,
        isPending,
        error,
    }
}