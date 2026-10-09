import { getTask } from "@/hooks/offers/offer-api";
import { offerKeys } from "@/hooks/offers/offers-keys";
import { orderKeys } from "@/hooks/orders/order-keys";
import type {
    DocumentStatus, Offer, OffersPage,
    Order
} from "@keepit/schemas";
import type { QueryClient } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";


function patchOfferDocuments(
    documents: Offer["offerDocuments"],
    taskId: string,
    status: DocumentStatus,
    error?: string,
) {
    return documents.map((doc) =>
        doc.taskId === taskId
            ? { ...doc, status, ...(error ? { error } : {}) }
            : doc
    );
}

function updateOfferDocumentStatus(
    queryClient: QueryClient,
    taskId: string,
    status: DocumentStatus,
    error?: string,
) {
    // Listen-Cache (`offerKeys.lists()`) und Einzelabruf-Cache (`offerKeys.details()`)
    // haben unterschiedliche Formen (`{items: [...]}` vs. ein einzelnes Offer) —
    // getrennt behandeln, statt beide unter `offerKeys.all` gemeinsam zu matchen.
    queryClient.setQueriesData<OffersPage>({ queryKey: offerKeys.lists() }, (page) => {
        if (!page || !page.items.length || !('offerDocuments' in page.items[0])) return page;
        return {
            ...page, items: page.items.map((offer) => ({
                ...offer,
                offerDocuments: patchOfferDocuments(offer.offerDocuments, taskId, status, error),
            }))
        };
    });

    queryClient.setQueriesData<Offer>({ queryKey: offerKeys.details() }, (offer) => {
        if (!offer || !('offerDocuments' in offer)) return offer;
        return { ...offer, offerDocuments: patchOfferDocuments(offer.offerDocuments, taskId, status, error) };
    });
}

function updateOrderDocumentStatus(
    queryClient: QueryClient,
    taskId: string,
    status: DocumentStatus,
    error?: string,
) {
    const patchDocuments = (documents: Order["documents"]) =>
        documents.map((doc) =>
            doc.taskId === taskId ? { ...doc, status, ...(error ? { error } : {}) } : doc
        );

    queryClient.setQueriesData<Order>({ queryKey: orderKeys.details() }, (order) => {
        if (!order || !('documents' in order)) return order;
        return { ...order, documents: patchDocuments(order.documents) };
    });

    queryClient.setQueriesData<Array<Order>>({ queryKey: orderKeys.lists() }, (orders) => {
        if (!Array.isArray(orders)) return orders;
        return orders.map((order) => ({
            ...order,
            documents: patchDocuments(order.documents),
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
            queryClient.invalidateQueries({ queryKey: offerKeys.details() });
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
            queryClient.invalidateQueries({ queryKey: orderKeys.details() });
        }

        if (task.status === "FAILED") {
            updateOfferDocumentStatus(queryClient, taskId, "FAILED", task.error ?? undefined);
            updateOrderDocumentStatus(queryClient, taskId, "FAILED", task.error ?? undefined);
        }
    }, [task, taskId, queryClient]);

    return { task };
};
