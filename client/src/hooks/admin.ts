import type { BaseUser, User } from "@/data/types";
import { createUserAction, getAllUsersAction, updateUserByIdAction, deleteUserAction } from "@/data/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useAdmin = () => {
    const queryClient = useQueryClient();

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