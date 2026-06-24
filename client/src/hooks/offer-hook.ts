import type {
    DocumentStatus,
    Offer,
    Order
} from "@/types";
import type { QueryClient } from "@tanstack/react-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
    getContactPersonsAction,
    getOfferRevisionsAction, getTaskByIdAction
} from "@/data/offer";


interface OfferQueryParams {
    search?: string;
    companyIds?: Array<string>;
    contactPersonIds?: Array<string>;
    sort?: string;
}

export const useOfferRevisionsHook = (offerId: string) => {
    const { data: revisions = [] } = useQuery({
        queryKey: ["offers", offerId, "revisions"],
        queryFn: () => getOfferRevisionsAction(offerId),
        enabled: !!offerId,
    });

    return { revisions };
};

function updateOfferDocumentStatus(
    queryClient: QueryClient,
    taskId: string,
    status: DocumentStatus,
    error?: string,
) {
    queryClient.setQueriesData<Array<Offer>>({ queryKey: ["offers"] }, (offers) => {
        if (!Array.isArray(offers) || (offers.length > 0 && !('offerDocuments' in offers[0]))) return offers;
        return offers.map((offer) => ({
            ...offer,
            offerDocuments: offer.offerDocuments.map((doc) =>
                doc.taskId === taskId
                    ? { ...doc, status, ...(error ? { error } : {}) }
                    : doc
            ),
        }));
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

export const useOfferHook = (params?: OfferQueryParams) => {
    const queryClient = useQueryClient();

    const { data: contactPersons = [] } = useQuery({
        queryKey: ["contact-persons"],
        queryFn: getContactPersonsAction,
    });

    return {
        contactPersons,
    };
};
