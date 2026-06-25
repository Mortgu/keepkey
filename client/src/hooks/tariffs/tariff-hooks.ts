import {useQuery} from "@tanstack/react-query";
import {tariffQueries} from "./tariff-queries";
import {
    useCreateTariff,
    useCreateTariffColumn,
    useCreateTariffRow,
    useDeleteTariff,
    useDeleteTariffColumn,
    useDeleteTariffRow,
    useUpdateTariffCell,
    useUpdateTariffColumn,
    useUpdateTariffRow,
} from "./tariff-mutations";

export function useTariffs(productId?: string) {
    const {data: tariffs = [], isPending, error} = useQuery(tariffQueries.list(productId));

    return {tariffs, isPending, error};
}

export function useTariffHistoryHook(productId: string, contractId: string) {
    const {data: history = [], isPending, error} = useQuery(tariffQueries.history(productId, contractId));

    return {history, isPending, error};
}

export function useTariffDurationsHook(productId: string, contractId: string) {
    const {data: durations = [], isPending, error} = useQuery(tariffQueries.durations(productId, contractId));

    return {durations, isPending, error};
}

export function useTariffHook(productId?: string) {
    const tariffQuery = useTariffs(productId);

    const createTariff = useCreateTariff();
    const deleteTariff = useDeleteTariff();
    const createColumn = useCreateTariffColumn();
    const deleteColumn = useDeleteTariffColumn();
    const updateColumn = useUpdateTariffColumn();
    const createRow = useCreateTariffRow();
    const deleteRow = useDeleteTariffRow();
    const updateRow = useUpdateTariffRow();
    const updateCell = useUpdateTariffCell();

    return {
        ...tariffQuery,
        ...createTariff,
        ...deleteTariff,
        ...createColumn,
        ...deleteColumn,
        ...updateColumn,
        ...createRow,
        ...deleteRow,
        ...updateRow,
        ...updateCell,
    };
}
