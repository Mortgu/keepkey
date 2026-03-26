import { useQuery, useQueryClient } from "@tanstack/react-query"

export const useAdmin = () => {
    const queryClient = useQueryClient();

    const { data: orders = [], isPending: pendingOrders, error: errorOrders } = useQuery({
        queryKey: ['admin:orders'],
        queryFn: () => { },
    });

    const { data: products = [], isPending: pendingProducts, error: errorProducts } = useQuery({
        queryKey: ['admin:products'],
        queryFn: () => { },
    });

    const { data: contracts = [], isPending: pendingContracts, error: errorContracts } = useQuery({
        queryKey: ['admin:contracts'],
        queryFn: () => { },
    });

    return {
        orders,
        pendingOrders,
        errorOrders,

        products,
        pendingProducts,
        errorProducts,

        contracts,
        pendingContracts,
        errorContracts,
    }
}