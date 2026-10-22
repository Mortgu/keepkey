import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { createConfirmation, deleteConfirmation, getConfirmationByOrder, regenerateConfirmation } from "./confirmation-api";
import { confirmationKeys } from "./confirmation-keys";
import { offerKeys } from "../offers/offers-keys";
import type { CreateConfirmationInput } from "@keepit/schemas";

export function useConfirmation(orderId: string) {
    const query = useQuery({
        queryKey: confirmationKeys.byOrder(orderId),
        queryFn: () => getConfirmationByOrder(orderId),
        // Solange ein Dokument läuft, nachladen — das Statusfeld hängt daran.
        refetchInterval: (q) =>
            q.state.data?.documents.some((d) => d.status === "PENDING" || d.status === "PROCESSING") ? 3_000 : false,
    });
    return { confirmation: query.data ?? null, isPending: query.isPending, error: query.error };
}

// Der Stage-Header im Vorgang liest die AB-Nummer/Status aus der eingebetteten
// Offer-Summary, nicht aus confirmationKeys — beide müssen also invalidiert werden.
async function invalidateConfirmationViews(queryClient: QueryClient, orderId: string) {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: confirmationKeys.byOrder(orderId) }),
        queryClient.invalidateQueries({ queryKey: offerKeys.all }),
    ]);
}

export function useCreateConfirmation(orderId: string) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (input: CreateConfirmationInput) => createConfirmation(orderId, input),
        onSuccess: () => invalidateConfirmationViews(queryClient, orderId),
    });
    return {
        createConfirmation: mutation.mutateAsync,
        isCreatingConfirmation: mutation.isPending,
        errorCreatingConfirmation: mutation.error,
    };
}

export function useRegenerateConfirmation(orderId: string) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: () => regenerateConfirmation(orderId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: confirmationKeys.byOrder(orderId) }),
    });
    return { regenerateConfirmation: mutation.mutate, isRegenerating: mutation.isPending };
}

export function useDeleteConfirmation(orderId: string) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: () => deleteConfirmation(orderId),
        onSuccess: () => invalidateConfirmationViews(queryClient, orderId),
    });
    return {
        deleteConfirmation: mutation.mutateAsync,
        isDeletingConfirmation: mutation.isPending,
        errorDeletingConfirmation: mutation.error,
    };
}
