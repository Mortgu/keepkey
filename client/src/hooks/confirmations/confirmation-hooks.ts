import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createConfirmation, getConfirmationByOrder, regenerateConfirmation } from "./confirmation-api";
import { confirmationKeys } from "./confirmation-keys";
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

export function useCreateConfirmation(orderId: string) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (input: CreateConfirmationInput) => createConfirmation(orderId, input),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: confirmationKeys.byOrder(orderId) }),
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
