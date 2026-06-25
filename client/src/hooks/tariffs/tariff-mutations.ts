import {useMutation, useQueryClient} from "@tanstack/react-query";
import {tariffKeys} from "./tariff-keys";
import {
    createTariffAction,
    createTariffColumnAction,
    createTariffRowAction,
    deleteTariffAction,
    deleteTariffColumnAction,
    deleteTariffRowAction,
    updateTariffCellAction,
    updateTariffColumnAction,
    updateTariffRowAction,
} from "@/data/tariffs";

const invalidateLists = (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({queryKey: tariffKeys.lists()});
};

const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) => {
    queryClient.invalidateQueries({queryKey: tariffKeys.all});
};

export function useCreateTariff() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({productId, contractId}: { productId: string, contractId: string }) =>
            createTariffAction(productId, contractId),
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
        mutationFn: ({tariffId}: { tariffId: string }) => deleteTariffAction(tariffId),
        onSuccess: () => invalidateAll(queryClient),
    });

    return {
        deleteTariff: mutation.mutateAsync,
        deleteTariffPending: mutation.isPending,
        deleteTariffError: mutation.error,
    };
}

export function useCreateTariffColumn() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({tariffId, duration}: { tariffId: string, duration: number }) =>
            createTariffColumnAction(tariffId, duration),
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
        mutationFn: ({tariffId, columnId}: { tariffId: string, columnId: string }) =>
            deleteTariffColumnAction(tariffId, columnId),
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
        mutationFn: ({tariffId, columnId, duration}: {
            tariffId: string, columnId: string, duration: number
        }) => updateTariffColumnAction(tariffId, columnId, duration),
        onSuccess: () => invalidateLists(queryClient),
    });

    return {
        updateColumn: mutation.mutateAsync,
        updatingColumn: mutation.isPending,
        errorUpdatingColumn: mutation.error,
    };
}

export function useCreateTariffRow() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({tariffId, min_qty, max_qty}: {
            tariffId: string, min_qty: number, max_qty: number
        }) => createTariffRowAction(tariffId, min_qty, max_qty),
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
        mutationFn: ({tariffId, rowId}: { tariffId: string, rowId: string }) =>
            deleteTariffRowAction(tariffId, rowId),
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
        mutationFn: ({tariffId, rowId, min_qty, max_qty}: {
            tariffId: string, rowId: string, min_qty: number, max_qty: number
        }) => updateTariffRowAction(tariffId, rowId, min_qty, max_qty),
        onSuccess: () => invalidateLists(queryClient),
    });

    return {
        updateRow: mutation.mutateAsync,
        updatingRow: mutation.isPending,
        errorUpdatingRow: mutation.error,
    };
}

export function useUpdateTariffCell() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({tariffId, cellId, default_price, customer_price}: {
            tariffId: string, cellId: string, default_price?: number, customer_price?: number
        }) => updateTariffCellAction(tariffId, cellId, default_price, customer_price),
        onSuccess: () => invalidateLists(queryClient),
    });

    return {
        updateCell: mutation.mutateAsync,
        updatingCell: mutation.isPending,
        errorUpdatingCell: mutation.error,
    };
}
