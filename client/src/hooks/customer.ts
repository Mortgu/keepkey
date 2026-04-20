import {
    getAllCustomersAction,
    getCustomerByIdAction,
    createCustomerAction,
    updateCustomerByIdAction,
    deleteCustomerAction,
} from "@/data/customers";
import type { Customer } from "@/data/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCustomers = () => {
    const queryClient = useQueryClient();

    const { data: customers = [], isPending, error } = useQuery({
        queryKey: ['customers'],
        queryFn: getAllCustomersAction,
    });

    const createMutation = useMutation({
        mutationFn: (body: Partial<Customer>) => createCustomerAction(body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, body }: { id: string; body: Partial<Customer> }) =>
            updateCustomerByIdAction(id, body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string }) => deleteCustomerAction(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
    });

    return {
        customers,
        isPending,
        error,

        createCustomer: createMutation.mutateAsync,
        isCreating: createMutation.isPending,

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
