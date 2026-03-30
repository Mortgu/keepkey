import { getAllOrdersAction } from "@/data/orders";
import { getAllUsersAction } from "@/data/user";
import { useQuery, useQueryClient } from "@tanstack/react-query"

export const useAdmin = () => {
    const queryClient = useQueryClient();

    const { data: orders = [], isPending: pendingOrders, error: errorOrders } = useQuery({
        queryKey: ['admin:orders'],
        queryFn: getAllOrdersAction,
    });

    const { data: products = [], isPending: pendingProducts, error: errorProducts } = useQuery({
        queryKey: ['admin:products'],
        queryFn: () => { },
    });

    const { data: contracts = [], isPending: pendingContracts, error: errorContracts } = useQuery({
        queryKey: ['admin:contracts'],
        queryFn: () => { },
    });

    const { data: users = [], isPending: pendingUsers, error: errorUsers } = useQuery({
        queryKey: ['admin:users'],
        queryFn: getAllUsersAction,
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

        users,
        pendingUsers,
        errorUsers,
    }
}