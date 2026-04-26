import { getAllOrdersAction } from "@/data/orders";
import { createProductAction, deleteProductAction, getAllProducts, updateProductAction } from "@/data/products";
import type { BaseUser, User } from "@/data/types";
import { createUserAction, getAllUsersAction, updateUserByIdAction, deleteUserAction } from "@/data/user";
import type { ProductItemProps } from "@/routes/_main/products/-components/product-item";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useAdmin = () => {
    const queryClient = useQueryClient();

    /* Admin Orders */
    const { data: orders = [], isPending: pendingOrders, error: errorOrders } = useQuery({
        queryKey: ['admin:orders'],
        queryFn: getAllOrdersAction,
    });

    /* Admin Contracts */
    /*const { data: contracts = [], isPending: pendingContracts, error: errorContracts } = useQuery({
        queryKey: ['admin:contracts'],
        queryFn: () => { },
    });*/

    /* Admin Users */
    const { data: users = [], isPending: pendingUsers, error: errorUsers } = useQuery({
        queryKey: ['admin:users'],
        queryFn: getAllUsersAction,
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ id, body }: { id: string, body: BaseUser }) => updateUserByIdAction(id, body),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['admin:users'],
        }),
    });

    const createUserMutation = useMutation({
        mutationFn: ({ body }: { body: Partial<User> }) => createUserAction(body),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['admin:users'],
        }),
    });

    const deleteUserMutation = useMutation({
        mutationFn: ({ id }: { id: string }) => deleteUserAction(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: ['admin:users'],
        })
    })

    return {
        orders,
        pendingOrders,
        errorOrders,



        /*contracts,
        pendingContracts,
        errorContracts,*/

        users,
        pendingUsers,
        errorUsers,
        updateUser: updateUserMutation.mutate,
        isUpdatingUser: updateUserMutation.isPaused,

        createUser: createUserMutation.mutateAsync,
        isCreatingUser: createUserMutation.isPending,

        deleteUser: deleteUserMutation.mutate,
        isDeletingUser: deleteUserMutation.isPending,
    }
}