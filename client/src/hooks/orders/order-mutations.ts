import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateOrderInput, UpdateOrderInput } from "./order-api";
import { createOrder, deleteOrder, generateOrderDocument, restoreOrderRevision, updateOrder } from "./order-api";
import { orderKeys } from "./order-keys";
import { useOrders } from "./order-hooks";

export function useCreateOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (input: CreateOrderInput) => createOrder(input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
    });

    return {
        createOrder: mutation.mutateAsync,
        isCreatingOrder: mutation.isPending,
        errorCreatingOrder: mutation.error,
    };
}

export function useDeleteOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (orderId: string) => deleteOrder(orderId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
    });

    return {
        deleteOrder: mutation.mutate,
        isDeletingOrder: mutation.isPending,
        errorDeletingOrder: mutation.error,
    };
}

export function useUpdateOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ orderId, input }: { orderId: string; input: UpdateOrderInput }) =>
            updateOrder(orderId, input),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(args.orderId) });
        },
    });

    return {
        updateOrder: mutation.mutateAsync,
        isUpdatingOrder: mutation.isPending,
        errorUpdatingOrder: mutation.error,
    };
}

export function useGenerateOrderDocument() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ orderId }: { orderId: string }) => generateOrderDocument(orderId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
    });

    return {
        generateOrderDocument: mutation.mutate,
        isGeneratingDocument: mutation.isPending,
    };
}

export function useRestoreOrderRevision() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ orderId, revisionId, expectedVersion }: {
            orderId: string;
            revisionId: string;
            expectedVersion: number;
        }) => restoreOrderRevision(orderId, revisionId, expectedVersion),
        onSuccess: (_, args) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.revisions(args.orderId) });
        },
    });

    return {
        restoreOrderRevision: mutation.mutateAsync,
        isRestoringRevision: mutation.isPending,
        restoringRevisionId: mutation.variables?.revisionId,
        errorRestoringRevision: mutation.error,
    };
}

export function useOrderManager() {
    const ordersQuery = useOrders();
    const createMutation = useCreateOrder();
    const updateMutation = useUpdateOrder();
    const deleteMutation = useDeleteOrder();
    const nextNumber = useNextOrderNumber();

    return {
        ...ordersQuery,
        ...nextNumber,
        ...createMutation,
        ...updateMutation,
        ...deleteMutation,
    };
}
