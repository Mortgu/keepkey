import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customerKeys } from "./customer-keys";
import { createCustomer, createCustomerContact, deleteCustomer, deleteCustomerContact, updateCustomer } from "./customer-api";
import type { CreateCustomerContactInput, CreateCustomerInput } from "@/types";

export function useCreateCustomer() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ input }: {
            input: CreateCustomerInput
        }) => createCustomer(input),
        onSuccess: () => queryClient.invalidateQueries({
            queryKey: customerKeys.lists(),
        }),
    });

    return {
        createCustomer: mutation.mutateAsync,
        isCreatingCustomer: mutation.isPending,
        errorCreatingCustomer: mutation.error,
    }
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ customerId, input }: {
            customerId: string, input: CreateCustomerInput
        }) => updateCustomer(customerId, input),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(args.customerId) });
        }
    });

    return {
        updateCustomer: mutation.mutateAsync,
        isUpdatingCustomer: mutation.isPending,
        errorUpdatingCustomer: mutation.error,
    }
}

export function useDeleteCustomer() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ customerId }: {
            customerId: string
        }) => deleteCustomer(customerId),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(args.customerId) });
        }
    });

    return {
        deleteCustomer: mutation.mutateAsync,
        isDeletingCustomer: mutation.isPending,
        errorDeletingCustomer: mutation.error,
    }
}

export function useCustomerHook() {
    const createCustomerMutation = useCreateCustomer();
    const updateCustomerMutation = useUpdateCustomer();
    const deleteCustomerMutation = useDeleteCustomer();

    return {
        ...createCustomerMutation,
        ...updateCustomerMutation,
        ...deleteCustomerMutation,
    }
}

export function useCreateCustomerContact() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, input }: {
            id: string, input: CreateCustomerContactInput
        }) => createCustomerContact(id, input),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(args.id) });
        }
    });

    return {
        createCustomerContact: mutation.mutateAsync,
        isCreatingCustomerContact: mutation.isPending,
        errorCreatingCustomerContact: mutation.error,
    }
}

export function useUpdateCustomerContact() {
    const queryClient = useQueryClient();

    return {}
}

export function useDeleteCustomerContact() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ id, contactId }: { id: string, contactId: string }) =>
            deleteCustomerContact(id, contactId),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(args.id) });
        }
    });

    return {
        deleteCustomerContact: mutation.mutateAsync,
        isDeletingCustomerContact: mutation.isPending,
        errorDeletingCustomerContact: mutation.error,
    }
}

export function useCustomerContactHook() {
    const createCustomerContactMutation = useCreateCustomerContact();
    const updateCustomerContactMutation = useUpdateCustomerContact();
    const delteCustomerContactMutation = useDeleteCustomerContact();

    return {
        ...createCustomerContactMutation,
        ...updateCustomerContactMutation,
        ...delteCustomerContactMutation,
    }
}
