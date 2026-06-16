import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";

import {
    addBandAction,
    addTermAction,
    createTariffAction,
    deleteTariffAction,
    getAllTariffsAction,
    getProductTariffsAction,
    removeBandAction,
    removeTermAction,
    updateCellAction,
    updateCustomerPriceAction,
    updateTermAction,
} from "@/data/tariffs";

export const useTariffHook = (productId?: string) => {
    const queryClient = useQueryClient();

    const queryKey = productId ? ["tariffs", productId] : ["tariffs"];

    const invalidate = () =>
        queryClient.invalidateQueries({queryKey: ["tariffs"]});

    const {data: tariffs = [], isPending, error} = useQuery({
        queryKey,
        queryFn: productId ? () => getProductTariffsAction(productId) : getAllTariffsAction,
    });

    const createTariffMutation = useMutation({
        mutationFn: ({productId, contractId}: { productId: string, contractId: string }) =>
            createTariffAction(productId, contractId),
        onSuccess: invalidate,
    });

    const deleteTariffMutation = useMutation({
        mutationFn: ({tariffId}: { tariffId: string }) =>
            deleteTariffAction(tariffId),
        onSuccess: invalidate,
    })

    const addTermMutation = useMutation({
        mutationFn: ({tariffId, duration}: { tariffId: string; duration: number }) =>
            addTermAction(tariffId, duration),
        onSuccess: invalidate,
    });

    const removeTermMutation = useMutation({
        mutationFn: ({tariffId, termIndex}: { tariffId: string; termIndex: number }) =>
            removeTermAction(tariffId, termIndex),
        onSuccess: invalidate,
    });

    const updateTermMutation = useMutation({
        mutationFn: ({tariffId, termIndex, duration}: { tariffId: string; termIndex: number, duration: number }) =>
            updateTermAction(tariffId, termIndex, duration),
        onSuccess: invalidate,
    })

    const addBandMutation = useMutation({
        mutationFn: ({tariffId, min_quantity, max_quantity, prices}: {
            tariffId: string;
            min_quantity: number;
            max_quantity: number;
            prices: number[];
        }) => addBandAction(tariffId, {min_quantity, max_quantity, prices}),
        onSuccess: invalidate,
    });

    const removeBandMutation = useMutation({
        mutationFn: (rowId: string) => removeBandAction(rowId),
        onSuccess: invalidate,
    });

    const updateCellMutation = useMutation({
        mutationFn: ({cellId, price}: { cellId: string; price: number }) =>
            updateCellAction(cellId, price),
        onSuccess: invalidate,
    });

    const updateCustomerPriceMutation = useMutation({
        mutationFn: ({cellId, customerId, price}: { cellId: string; customerId: string; price: number }) =>
            updateCustomerPriceAction(cellId, customerId, price),
        onSuccess: invalidate,
    });

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

        addTerm: addTermMutation.mutate,
        addTermPending: addTermMutation.isPending,
        addTermError: addTermMutation.error,

        removeTerm: removeTermMutation.mutate,
        removeTermPending: removeTermMutation.isPending,
        removeTermError: removeTermMutation.error,

        updateTerm: updateTermMutation.mutate,
        updateTermPending: updateTermMutation.isPending,
        updateTermError: updateTermMutation.error,

        addBand: addBandMutation.mutate,
        addBandPending: addBandMutation.isPending,
        addBandError: addBandMutation.error,

        removeBand: removeBandMutation.mutate,
        removeBandPending: removeBandMutation.isPending,
        removeBandError: removeBandMutation.error,

        updateCell: updateCellMutation.mutate,
        updateCellPending: updateCellMutation.isPending,
        updateCellError: updateCellMutation.error,

        updateCustomerPrice: updateCustomerPriceMutation.mutate,
        updateCustomerPricePending: updateCustomerPriceMutation.isPending,
        updateCustomerPriceError: updateCustomerPriceMutation.error,
    };
};
