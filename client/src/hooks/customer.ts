import {
    createCustomerAction,
    deleteCustomerAction,
    getAllCustomersAction,
    getCustomerByIdAction,
    updateCustomerByIdAction,
} from "@/data/customers";
import type {BaseCustomer, CreateCustomer} from "@/data/types";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

export const useCustomers = () => {
    const queryClient = useQueryClient();

    const invalidate = () => queryClient.invalidateQueries({queryKey: ['customers']});

    const {data: customers = [], isPending, error} = useQuery({
        queryKey: ['customers'],
        queryFn: getAllCustomersAction,
    });

    const createMutation = useMutation({
        mutationFn: (body: CreateCustomer) => createCustomerAction(body),
        onSuccess: invalidate
    });

    const updateMutation = useMutation({
        mutationFn: ({id, body}: { id: string; body: BaseCustomer }) =>
            updateCustomerByIdAction(id, body),
        onSuccess: invalidate
    });

    const deleteMutation = useMutation({
        mutationFn: ({id}: { id: string }) => deleteCustomerAction(id),
        onSuccess: invalidate
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
    const {data: customer = null, isPending, error} = useQuery({
        queryKey: ['customers', id],
        queryFn: () => getCustomerByIdAction(id),
        enabled: !!id,
    });

    return {customer, isPending, error};
};
