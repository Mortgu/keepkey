import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { createInvoice, deleteInvoice, getInvoiceByOrder, getInvoices, regenerateInvoice } from "./invoice-api";
import { invoiceKeys } from "./invoice-keys";
import { offerKeys } from "../offers/offers-keys";
import type { CreateInvoiceInput, InvoiceFilterParams } from "@keepit/schemas";

export function useInvoice(orderId: string) {
    const query = useQuery({
        queryKey: invoiceKeys.byOrder(orderId),
        queryFn: () => getInvoiceByOrder(orderId),
        // Solange ein Dokument läuft, nachladen — das Statusfeld hängt daran.
        refetchInterval: (q) =>
            q.state.data?.documents.some((d) => d.status === "PENDING" || d.status === "PROCESSING") ? 3_000 : false,
    });
    return { invoice: query.data ?? null, isPending: query.isPending, error: query.error };
}

// Der Stage-Header im Vorgang liest die Rechnungsnummer/Status aus der
// eingebetteten Offer-Summary, nicht aus invoiceKeys — beide müssen also invalidiert werden.
async function invalidateInvoiceViews(queryClient: QueryClient, orderId: string) {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: invoiceKeys.byOrder(orderId) }),
        queryClient.invalidateQueries({ queryKey: offerKeys.all }),
    ]);
}

export function useCreateInvoice(orderId: string) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (input: CreateInvoiceInput) => createInvoice(orderId, input),
        onSuccess: () => invalidateInvoiceViews(queryClient, orderId),
    });
    return {
        createInvoice: mutation.mutateAsync,
        isCreatingInvoice: mutation.isPending,
        errorCreatingInvoice: mutation.error,
    };
}

export function useRegenerateInvoice(orderId: string) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: () => regenerateInvoice(orderId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: invoiceKeys.all }),
    });
    return { regenerateInvoice: mutation.mutate, isRegenerating: mutation.isPending };
}

export function useDeleteInvoice(orderId: string) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: () => deleteInvoice(orderId),
        onSuccess: () => invalidateInvoiceViews(queryClient, orderId),
    });
    return {
        deleteInvoice: mutation.mutateAsync,
        isDeletingInvoice: mutation.isPending,
        errorDeletingInvoice: mutation.error,
    };
}

export function useInvoices(filters: InvoiceFilterParams = {}) {
    const query = useQuery({
        queryKey: invoiceKeys.list(filters),
        queryFn: () => getInvoices(filters),
    });
    return { invoices: query.data ?? [], isPending: query.isPending, error: query.error };
}
