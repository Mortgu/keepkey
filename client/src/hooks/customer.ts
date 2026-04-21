import {
    getAllCustomersAction,
    getCustomerByIdAction,
    createCustomerAction,
    updateCustomerByIdAction,
    deleteCustomerAction,
} from "@/data/customers";
import type { BaseCustomer, CreateCustomer, Customer } from "@/data/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCustomers = () => {
    const queryClient = useQueryClient();
    const queryKey = ['customers'];

    const { data: customers = [], isPending, error } = useQuery({
        queryKey: queryKey,
        queryFn: getAllCustomersAction,
    });

    const createMutation = useMutation({
        mutationFn: (body: CreateCustomer) => createCustomerAction(body),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: queryKey
        }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, body }: { id: string; body: BaseCustomer }) =>
            updateCustomerByIdAction(id, body),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: queryKey
        }),
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string }) => deleteCustomerAction(id),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: queryKey
        }),
    });

    return {
        customers,
        isPending,
        error,

        createCustomer: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        errorCreatingCustomer: createMutation.error,

        updateCustomer: updateMutation.mutate,
        isUpdating: updateMutation.isPending,

        deleteCustomer: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
    };
};

export const useCustomer = (id: string) => {
    const { data: customer = null, isPending, error } = useQuery({
        queryKey: ['customers', id],
        queryFn: () => getCustomerByIdAction(id),
        enabled: !!id,
    });

    return { customer, isPending, error };
};
