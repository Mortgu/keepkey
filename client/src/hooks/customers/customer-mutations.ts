import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerKeys } from "./customer-keys";
import { createCustomer, createCustomerContact, deleteCustomer, deleteCustomerContact, updateCustomer, updateCustomerContact } from "./customer-api";
import type { CreateCustomerContactInput, CreateCustomerInput, DocumentStatus, OffersPage, Order, UpdateCustomerContactInput } from "@/types";
import { getTaskByIdAction } from "@/data/offer";
import { useEffect } from "react";

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

export function useCustomerManager() {
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

    const mutation = useMutation({
        mutationFn: ({ id, contactId, input }: {
            id: string, contactId: string, input: UpdateCustomerContactInput
        }) => updateCustomerContact(id, contactId, input),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: customerKeys.detail(args.id) });
        }
    });

    return {
        updateCustomerContact: mutation.mutateAsync,
        isUpdatingCustomerContact: mutation.isPending,
        errorUpdatingCustomerContact: mutation.error,
    }
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
    const deleteCustomerContactMutation = useDeleteCustomerContact();

    return {
        ...createCustomerContactMutation,
        ...updateCustomerContactMutation,
        ...deleteCustomerContactMutation,
    }
}



function updateOfferDocumentStatus(
    queryClient: QueryClient,
    taskId: string,
    status: DocumentStatus,
    error?: string,
) {
    queryClient.setQueriesData<OffersPage>({ queryKey: ["offers"] }, (page) => {
        if (!page || !page.items?.length || !('offerDocuments' in page.items[0])) return page;
        return {
            ...page, items: page.items.map((offer) => ({
                ...offer,
                offerDocuments: offer.offerDocuments.map((doc) =>
                    doc.taskId === taskId ? { ...doc, status, ...(error ? { error } : {}) } : doc
                ),
            }))
        };
    });
}

function updateOrderDocumentStatus(
    queryClient: QueryClient,
    taskId: string,
    status: DocumentStatus,
    error?: string,
) {
    queryClient.setQueriesData<Array<Order>>({ queryKey: ["orders"], exact: true }, (orders) => {
        if (!Array.isArray(orders)) return orders;
        return orders.map((order) => ({
            ...order,
            documents: order.documents.map((doc) =>
                doc.taskId === taskId
                    ? { ...doc, status, ...(error ? { error } : {}) }
                    : doc
            ),
        }));
    });
}



export const useDocumentTask = (taskId?: string) => {
    const queryClient = useQueryClient();

    const { data: task } = useQuery({
        queryKey: ["task", taskId],
        queryFn: () => getTaskByIdAction(taskId!),
        refetchInterval: (query) => {
            if (query.state.data?.status === "COMPLETED") {
                return false;
            }

            if (query.state.data?.status === "FAILED") {
                return false;
            }

            return 2000;
        },

        enabled: !!taskId,
    });

    useEffect(() => {
        if (!task || !taskId) return;

        if (task.status === "COMPLETED") {
            updateOfferDocumentStatus(queryClient, taskId, "GENERATED");
            updateOrderDocumentStatus(queryClient, taskId, "GENERATED");
            queryClient.invalidateQueries({ queryKey: ["offers"] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        }

        if (task.status === "FAILED") {
            updateOfferDocumentStatus(queryClient, taskId, "FAILED", task.error ?? undefined);
            updateOrderDocumentStatus(queryClient, taskId, "FAILED", task.error ?? undefined);
        }
    }, [task?.status, taskId, queryClient]);

    return { task };
};
