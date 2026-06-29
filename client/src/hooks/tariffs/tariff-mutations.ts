import {useMutation, useQueryClient} from "@tanstack/react-query";
import {tariffKeys} from "./tariff-keys";
import {
    createTariff,
    createTariffColumn,
    createTariffGroup,
    createTariffRow,
    deleteTariff,
    deleteTariffColumn,
    deleteTariffGroup,
    deleteTariffRow,
    updateTariffCell,
    updateTariffColumn,
    updateTariffGroup,
    updateTariffRow,
} from "./tariff-api";
import type {
    CreateTariffGroupInput,
    CreateTariffInput,
    UpdateTariffGroupInput,
} from "@/types";

const invalidateLists = (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({queryKey: tariffKeys.lists()});
};

const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({queryKey: tariffKeys.all});
};

/* ───────────────────────────────
   TariffGroup
   ─────────────────────────────── */

export function useCreateTariffGroup() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (input: CreateTariffGroupInput) => createTariffGroup(input),
        onSuccess: () => invalidateAll(queryClient),
    });

    return {
        createTariffGroup: mutation.mutate,
        createTariffGroupPending: mutation.isPending,
        createTariffGroupError: mutation.error,
    };
}

export function useUpdateTariffGroup() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({id, input}: { id: string, input: UpdateTariffGroupInput }) =>
            updateTariffGroup(id, input),
        onSuccess: () => invalidateAll(queryClient),
    });

    return {
        updateTariffGroup: mutation.mutate,
        updateTariffGroupPending: mutation.isPending,
        updateTariffGroupError: mutation.error,
    };
}

export function useDeleteTariffGroup() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({id}: { id: string }) => deleteTariffGroup(id),
        onSuccess: () => invalidateAll(queryClient),
    });

    return {
        deleteTariffGroup: mutation.mutateAsync,
        deleteTariffGroupPending: mutation.isPending,
        deleteTariffGroupError: mutation.error,
    };
}

/* ───────────────────────────────
   Tariff
   ─────────────────────────────── */

export function useCreateTariff() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({groupId, input}: { groupId: string, input: CreateTariffInput }) =>
            createTariff(groupId, input),
        onSuccess: () => invalidateAll(queryClient),
    });

    return {
        createTariff: mutation.mutate,
        createTariffPending: mutation.isPending,
        createTariffError: mutation.error,
    };
}

export function useDeleteTariff() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({groupId, tariffId}: { groupId: string, tariffId: string }) =>
            deleteTariff(groupId, tariffId),
        onSuccess: () => invalidateAll(queryClient),
    });

    return {
        deleteTariff: mutation.mutateAsync,
        deleteTariffPending: mutation.isPending,
        deleteTariffError: mutation.error,
    };
}

/* ───────────────────────────────
   Column
   ─────────────────────────────── */

export function useCreateTariffColumn() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({groupId, tariffId, duration}: { groupId: string, tariffId: string, duration: number }) =>
            createTariffColumn(groupId, tariffId, duration),
        onSuccess: () => invalidateLists(queryClient),
    });

    return {
        createColumn: mutation.mutateAsync,
        creatingColumn: mutation.isPending,
        errorCreatingColumn: mutation.error,
    };
}

export function useDeleteTariffColumn() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({groupId, tariffId, columnId}: { groupId: string, tariffId: string, columnId: string }) =>
            deleteTariffColumn(groupId, tariffId, columnId),
        onSuccess: () => invalidateLists(queryClient),
    });

    return {
        deleteColumn: mutation.mutateAsync,
        deletingColumn: mutation.isPending,
        errorDeletingColumn: mutation.error,
    };
}

export function useUpdateTariffColumn() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({groupId, tariffId, columnId, duration}: {
            groupId: string, tariffId: string, columnId: string, duration: number
        }) => updateTariffColumn(groupId, tariffId, columnId, duration),
        onSuccess: () => invalidateLists(queryClient),
    });

    return {
        updateColumn: mutation.mutateAsync,
        updatingColumn: mutation.isPending,
        errorUpdatingColumn: mutation.error,
    };
}

/* ───────────────────────────────
   Row
   ─────────────────────────────── */

export function useCreateTariffRow() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({groupId, tariffId, min_qty, max_qty}: {
            groupId: string, tariffId: string, min_qty: number, max_qty: number
        }) => createTariffRow(groupId, tariffId, min_qty, max_qty),
        onSuccess: () => invalidateLists(queryClient),
    });

    return {
        createRow: mutation.mutateAsync,
        creatingRow: mutation.isPending,
        errorCreatingRow: mutation.error,
    };
}

export function useDeleteTariffRow() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({groupId, tariffId, rowId}: { groupId: string, tariffId: string, rowId: string }) =>
            deleteTariffRow(groupId, tariffId, rowId),
        onSuccess: () => invalidateLists(queryClient),
    });

    return {
        deleteRow: mutation.mutateAsync,
        deletingRow: mutation.isPending,
        errorDeletingRow: mutation.error,
    };
}

export function useUpdateTariffRow() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({groupId, tariffId, rowId, min_qty, max_qty}: {
            groupId: string, tariffId: string, rowId: string, min_qty: number, max_qty: number
        }) => updateTariffRow(groupId, tariffId, rowId, min_qty, max_qty),
        onSuccess: () => invalidateLists(queryClient),
    });

    return {
        updateRow: mutation.mutateAsync,
        updatingRow: mutation.isPending,
        errorUpdatingRow: mutation.error,
    };
}

/* ───────────────────────────────
   Cell
   ─────────────────────────────── */

export function useUpdateTariffCell() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({groupId, tariffId, cellId, default_price, customer_price}: {
            groupId: string, tariffId: string, cellId: string, default_price?: number, customer_price?: number
        }) => updateTariffCell(groupId, tariffId, cellId, default_price, customer_price),
        onSuccess: () => invalidateLists(queryClient),
    });

    return {
        updateCell: mutation.mutateAsync,
        updatingCell: mutation.isPending,
        errorUpdatingCell: mutation.error,
    };
}
