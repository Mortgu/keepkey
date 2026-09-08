import { useMutation, useQueryClient } from "@tanstack/react-query";
import { offerKeys } from "../offers/offers-keys";
import { customerKeys } from "../customers/customer-keys";
import { supplierKeys } from "../suppliers/supplier-keys";
import { dashboardKeys } from "../dashboard/dashboard-keys";
import { searchKeys } from "../search/search-keys";

import { cancelOrder, createOrder, generateOrderDocument, restoreOrderRevision, updateOrder } from "./order-api";
import { orderKeys } from "./order-keys";
import { useNextOrderNumber, useOrders } from "./order-hooks";
import type { QueryClient } from "@tanstack/react-query";
import type { CreateOrderInput, UpdateOrderInput } from "./order-api";
import { showToast } from "@/components";

async function invalidateOrderViews(client: QueryClient) {
    await Promise.all([orderKeys.all, offerKeys.all, customerKeys.all, supplierKeys.all, dashboardKeys.all, searchKeys.all]
        .map(queryKey => client.invalidateQueries({ queryKey })));
}
export function useCreateOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (input: CreateOrderInput) => createOrder(input),
        onSuccess: () => invalidateOrderViews(queryClient),
    });

    return {
        createOrder: mutation.mutateAsync,
        isCreatingOrder: mutation.isPending,
        errorCreatingOrder: mutation.error,
    };
}

export function useCancelOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ orderId, expectedVersion }: { orderId: string; expectedVersion: number }) => cancelOrder(orderId, expectedVersion),
        onSuccess: async () => { await invalidateOrderViews(queryClient); showToast.success("orders.cancelSuccess"); },
    });

    return {
        cancelOrder: mutation.mutateAsync,
        isCancellingOrder: mutation.isPending,
        errorCancellingOrder: mutation.error,
    };
}

export function useUpdateOrder() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ orderId, input }: { orderId: string; input: UpdateOrderInput }) =>
            updateOrder(orderId, input),
        onSuccess: () => invalidateOrderViews(queryClient),
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
    const cancelMutation = useCancelOrder();
    const nextNumber = useNextOrderNumber();

    return {
        ...ordersQuery,
        ...nextNumber,
        ...createMutation,
        ...updateMutation,
        ...cancelMutation,
    };
}
