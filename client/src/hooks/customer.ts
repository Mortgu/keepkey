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
        queryKey: ['admin:customers'],
        queryFn: getAllCustomersAction,
    });

    const createMutation = useMutation({
        mutationFn: (body: Partial<Customer>) => createCustomerAction(body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin:customers'] }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, body }: { id: string; body: Partial<Customer> }) =>
            updateCustomerByIdAction(id, body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin:customers'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string }) => deleteCustomerAction(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin:customers'] }),
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
        queryKey: ['admin:customers', id],
        queryFn: () => getCustomerByIdAction(id),
        enabled: !!id,
    });

    return { customer, isPending, error };
};
