import { getCurrentUser, upsertAddress, createContactPersons, deleteAccountAction } from "@/data/user";
import type { ContactPerson } from "@/data/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUser = () => {
    const queryClient = useQueryClient();

    const { data: user = null, isPending, error } = useQuery({
        queryKey: ['user:session'],
        queryFn: getCurrentUser,
    });

    const createContactPersonsMutation = useMutation({
        mutationFn: (persons: Array<Omit<ContactPerson, 'id' | 'createdAt' | 'updatedAt'>>) =>
            createContactPersons(persons),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user:session'] }),
    });

    const deleteAccountMutation = useMutation({
        mutationFn: deleteAccountAction,
        onSuccess: () => queryClient.removeQueries({ queryKey: ['user:session'] }),
    });

    return {
        user,
        isPending,
        error,

        createContactPersons: createContactPersonsMutation.mutateAsync,
        isCreatingContactPersons: createContactPersonsMutation.isPending,

        deleteAccount: deleteAccountMutation.mutate,
        isDeletingAccount: deleteAccountMutation.isPending,
    };
};
