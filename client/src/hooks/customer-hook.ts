import {
  createContactAction,
  createCustomerAction,
  deleteContactAction,
  deleteCustomerAction,
  getAllCustomersAction,
  updateContactAction,
  updateCustomerByIdAction,
} from "@/data/customers";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import type {
  CreateContactPersonInput,
  CreateCustomerInput,
  UpdateContactPersonInput,
  UpdateCustomerInput
} from "@/types";

export const useCustomerHook = () => {
    const queryClient = useQueryClient();

    const invalidate = () =>
        queryClient.invalidateQueries({queryKey: ["customers"]});

    const {data: customers = [], isPending, error} = useQuery({
        queryKey: ["customers"],
        queryFn: getAllCustomersAction,
    });

    const createCustomerMutation = useMutation({
        mutationFn: ({body}: { body: CreateCustomerInput }) => createCustomerAction(body),
        onSuccess: invalidate,
    });

    const createContactMutation = useMutation({
        mutationFn: (body: CreateContactPersonInput) => createContactAction(body),
        onSuccess: invalidate,
    })

    const updateCustomerMutation = useMutation({
        mutationFn: ({id, body}: { id: string; body: UpdateCustomerInput }) =>
            updateCustomerByIdAction(id, body),
        onSuccess: invalidate,
    });

    const updateContactMutation = useMutation({
        mutationFn: ({id, body}: { id: string; body: UpdateContactPersonInput }) =>
            updateContactAction(id, body),
        onSuccess: invalidate,
    })

    const deleteCustomerMutation = useMutation({
        mutationFn: ({id}: { id: string }) => deleteCustomerAction(id),
        onSuccess: invalidate,
    });

    const deleteContactMutation = useMutation({
        mutationFn: ({id}: { id: string }) => deleteContactAction(id),
        onSuccess: invalidate,
    });

    return {
        customers,
        isPending,
        error,

        createCustomer: createCustomerMutation.mutate,
        isCreating: createCustomerMutation.isPending,
        errorCreatingCustomer: createCustomerMutation.error,

        createContact: createContactMutation.mutateAsync,
        isCreatingContact: createContactMutation.isPending,
        errorCreatingContact: createContactMutation.error,

        updateCustomer: updateCustomerMutation.mutate,
        isUpdating: updateCustomerMutation.isPending,

        updateContact: updateContactMutation.mutate,
        isUpdatingContact: updateContactMutation.isPending,
        errorUpdatingContact: updateContactMutation.error,

        deleteCustomer: deleteCustomerMutation.mutate,
        isDeleting: deleteCustomerMutation.isPending,
        errorDeleting: deleteCustomerMutation.error,

        deleteContact: deleteContactMutation.mutate,
        isDeletingContact: deleteContactMutation.isPending,
        errorDeletingContact: deleteContactMutation.error,
    };
};
