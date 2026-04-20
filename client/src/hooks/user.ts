import { getCurrentUser, upsertAddress, createContactPersons, deleteAccountAction } from "@/data/user";
import type { Address, ContactPerson } from "@/data/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUser = () => {
    const queryClient = useQueryClient();

    const { data: user = null, isPending, error } = useQuery({
        queryKey: ['user:session'],
        queryFn: getCurrentUser,
    });

    const updateAddressMutation = useMutation({
        mutationFn: (data: Omit<Address, 'id'>) => upsertAddress(data as { street: string; plz: string; city: string; phone?: string }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user:session'] }),
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

        updateAddress: updateAddressMutation.mutateAsync,
        isUpdatingAddress: updateAddressMutation.isPending,

        createContactPersons: createContactPersonsMutation.mutateAsync,
        isCreatingContactPersons: createContactPersonsMutation.isPending,

        deleteAccount: deleteAccountMutation.mutate,
        isDeletingAccount: deleteAccountMutation.isPending,
    };
};
