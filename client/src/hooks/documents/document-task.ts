import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import type { DocumentStatus, OffersPage, Order } from "@/types";
import { getTask } from "@/hooks/offers/offer-api";
import { offerKeys } from "@/hooks/offers/offers-keys";
import { orderKeys } from "@/hooks/orders/order-keys";

function updateOfferDocumentStatus(
    queryClient: QueryClient,
    taskId: string,
    status: DocumentStatus,
    error?: string,
) {
    queryClient.setQueriesData<OffersPage>({ queryKey: offerKeys.all }, (page) => {
        if (!page || !page.items.length || !('offerDocuments' in page.items[0])) return page;
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
    queryClient.setQueriesData<Array<Order>>({ queryKey: orderKeys.lists() }, (orders) => {
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
        queryFn: () => getTask(taskId!),
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

    // Re-run only when the task's status flips (not on every poll tick), so the
    // cache patch + invalidation fire exactly once per terminal state.
    useEffect(() => {
        if (!task || !taskId) return;

        if (task.status === "COMPLETED") {
            updateOfferDocumentStatus(queryClient, taskId, "GENERATED");
            updateOrderDocumentStatus(queryClient, taskId, "GENERATED");
            queryClient.invalidateQueries({ queryKey: offerKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
        }

        if (task.status === "FAILED") {
            updateOfferDocumentStatus(queryClient, taskId, "FAILED", task.error ?? undefined);
            updateOrderDocumentStatus(queryClient, taskId, "FAILED", task.error ?? undefined);
        }
    }, [task?.status, taskId, queryClient]);

    return { task };
};
