import type { CreateUserInput, UpdateUserInput } from "@/types";
import {
  createUserAction,
  deleteUserAction,
  getAllUsersAction,
  updateUserByIdAction,
} from "@/data/user";
import { useQueryClient } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUserHook = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["users"] });

  const {
    data: users = [],
    isPending,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsersAction,
  });

  const createUserMutation = useMutation({
    mutationFn: ({ body }: { body: CreateUserInput }) => createUserAction(body),
    onSuccess: invalidate,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateUserInput }) =>
      updateUserByIdAction(id, body),
    onSuccess: invalidate,
  });

  const deleteUserMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteUserAction(id),
    onSuccess: invalidate,
  });

  return {
    users,
    isPending,
    error,

    createUser: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,
    errorCreatingUser: createUserMutation.error,

    updateUser: updateUserMutation.mutate,
    isUpdatingUser: updateUserMutation.isPaused,
    errorUpdatingUser: updateUserMutation.error,

    deleteUser: deleteUserMutation.mutate,
    isDeletingUser: deleteUserMutation.isPending,
    errorDeletingUser: deleteUserMutation.error,
  };
};
