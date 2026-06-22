import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

import {
    createTariffAction,
    createTariffColumnAction,
    createTariffRowAction,
    deleteTariffAction,
    deleteTariffColumnAction,
    deleteTariffRowAction,
    getAllTariffsAction,
    getProductTariffsAction,
    getTariffDurationsAction,
    getTariffHistoryAction,
    updateTariffCellAction,
    updateTariffColumnAction,
    updateTariffRowAction,
} from "@/data/tariffs";

export const useTariffHook = (productId?: string) => {
    const queryClient = useQueryClient();

    const queryKey = productId ? ["tariffs", productId] : ["tariffs"];

    const invalidateTariffs = () => {
        queryClient.invalidateQueries({queryKey: ["tariffs"]});
    };

    const invalidateAll = () => {
        queryClient.invalidateQueries({queryKey: ["tariffs"]});
        queryClient.invalidateQueries({queryKey: ["tariff-history"]});
    };

    const {data: tariffs = [], isPending, error} = useQuery({
        queryKey,
        queryFn: productId ? () => getProductTariffsAction(productId) : getAllTariffsAction,
    });

    const createTariffMutation = useMutation({
        mutationFn: ({productId, contractId}: { productId: string, contractId: string }) =>
            createTariffAction(productId, contractId),
        onSuccess: invalidateAll,
    });

    const deleteTariffMutation = useMutation({
        mutationFn: ({tariffId}: { tariffId: string }) =>
            deleteTariffAction(tariffId),
        onSuccess: invalidateAll,
    })

    const createTariffColumnMutation = useMutation({
        mutationFn: ({tariffId, duration}: { tariffId: string, duration: number }) =>
            createTariffColumnAction(tariffId, duration),
        onSuccess: invalidateTariffs,
    })

    const deleteTariffColumnMutation = useMutation({
        mutationFn: ({tariffId, columnId}: { tariffId: string, columnId: string }) =>
            deleteTariffColumnAction(tariffId, columnId),
        onSuccess: invalidateTariffs,
    });

    const updateTariffColumnMutation = useMutation({
        mutationFn: ({tariffId, columnId, duration}: { tariffId: string, columnId: string, duration: number }) =>
            updateTariffColumnAction(tariffId, columnId, duration),
        onSuccess: invalidateTariffs,
    });

    const createTariffRowMutation = useMutation({
        mutationFn: ({tariffId, min_qty, max_qty}: {
            tariffId: string, min_qty: number, max_qty: number
        }) => createTariffRowAction(tariffId, min_qty, max_qty),
        onSuccess: invalidateTariffs,
    });

    const deleteTariffRowMutation = useMutation({
        mutationFn: ({tariffId, rowId}: {
            tariffId: string, rowId: string
        }) => deleteTariffRowAction(tariffId, rowId),
        onSuccess: invalidateTariffs,
    });

    const updateTariffRowMutation = useMutation({
        mutationFn: ({tariffId, rowId, min_qty, max_qty}: {
            tariffId: string, rowId: string, min_qty: number, max_qty: number
        }) => updateTariffRowAction(tariffId, rowId, min_qty, max_qty),
        onSuccess: invalidateTariffs,
    });

    const updateTariffCellMutation = useMutation({
        mutationFn: ({tariffId, cellId, default_price, customer_price}: {
            tariffId: string, cellId: string, default_price?: number, customer_price?: number
        }) =>
            updateTariffCellAction(tariffId, cellId, default_price, customer_price),
        onSuccess: invalidateTariffs,
    })

    return {
        tariffs,
        isPending,
        error,

        createTariff: createTariffMutation.mutate,
        createTariffPending: createTariffMutation.isPending,
        createTariffError: createTariffMutation.error,

        deleteTariff: deleteTariffMutation.mutateAsync,
        deleteTariffPending: deleteTariffMutation.isPending,
        deleteTariffError: deleteTariffMutation.error,

        createColumn: createTariffColumnMutation.mutateAsync,
        creatingColumn: createTariffColumnMutation.isPending,
        errorCreatingColumn: createTariffColumnMutation.error,

        deleteColumn: deleteTariffColumnMutation.mutateAsync,
        deletingColumn: deleteTariffColumnMutation.isPending,
        errorDeletingColumn: deleteTariffColumnMutation.error,

        updateColumn: updateTariffColumnMutation.mutateAsync,
        updatingColumn: updateTariffColumnMutation.isPending,
        errorUpdatingColumn: updateTariffColumnMutation.error,

        createRow: createTariffRowMutation.mutateAsync,
        creatingRow: createTariffRowMutation.isPending,
        errorCreatingRow: createTariffRowMutation.error,

        deleteRow: deleteTariffRowMutation.mutateAsync,
        deletingRow: deleteTariffRowMutation.isPending,
        errorDeletingRow: deleteTariffRowMutation.error,

        updateRow: updateTariffRowMutation.mutateAsync,
        updatingRow: updateTariffRowMutation.isPending,
        errorUpdatingRow: updateTariffRowMutation.error,

        updateCell: updateTariffCellMutation.mutateAsync,
        updatingCell: updateTariffCellMutation.isPending,
        errorUpdatingCell: updateTariffCellMutation.error,
    };
};

export const useTariffHistoryHook = (productId: string, contractId: string) => {
    const {data: history = [], isPending, error} = useQuery({
        queryKey: ["tariff-history", productId, contractId],
        queryFn: () => getTariffHistoryAction(productId, contractId),
        enabled: !!productId && !!contractId,
    });

    return {history, isPending, error};
};

export const useTariffDurationsHook = (productId: string, contractId: string) => {
    const {data: durations = [], isPending, error} = useQuery({
        queryKey: ["tariff-durations", productId, contractId],
        queryFn: () => getTariffDurationsAction(productId, contractId),
        enabled: !!productId && !!contractId,
    });

    return {durations, isPending, error};
};
