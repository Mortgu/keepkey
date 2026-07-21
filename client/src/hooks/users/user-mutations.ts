import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateUserInput, UpdateUserInput } from "@/types";
import { createUser, deleteUser, updateUser } from "./user-api";
import { userKeys } from "./user-keys";
import { useUsers } from "./user-hooks";

export function useCreateUser() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (body: CreateUserInput) => createUser(body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
    });

    return {
        createUser: mutation.mutateAsync,
        isCreatingUser: mutation.isPending,
        errorCreatingUser: mutation.error,
    };
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, body }: { id: string; body: UpdateUserInput }) =>
            updateUser(id, body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
    });

    return {
        updateUser: mutation.mutate,
        isUpdatingUser: mutation.isPending,
        errorUpdatingUser: mutation.error,
    };
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (id: string) => deleteUser(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
    });

    return {
        deleteUser: mutation.mutate,
        isDeletingUser: mutation.isPending,
        errorDeletingUser: mutation.error,
    };
}

export function useUserManager() {
    const usersQuery = useUsers();
    const createMutation = useCreateUser();
    const updateMutation = useUpdateUser();
    const deleteMutation = useDeleteUser();

    return {
        ...usersQuery,
        ...createMutation,
        ...updateMutation,
        ...deleteMutation,
    };
}
