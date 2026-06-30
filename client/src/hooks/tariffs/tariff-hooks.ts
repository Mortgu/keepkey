import {useQuery} from "@tanstack/react-query";
import {tariffQueries} from "./tariff-queries";
import {
    useCreateTariff,
    useCreateTariffColumn,
    useCreateTariffGroup,
    useCreateTariffRow,
    useDeleteTariff,
    useDeleteTariffColumn,
    useDeleteTariffGroup,
    useDeleteTariffRow,
    useUpdateTariffCell,
    useUpdateTariffColumn,
    useUpdateTariffGroup,
    useUpdateTariffRow,
} from "./tariff-mutations";

export function useTariffGroups() {
    const {data: groups = [], isPending, error} = useQuery(tariffQueries.groups());

    return {groups, isPending, error};
}

export function useTariffHistoryHook(productId: string, contractId: string) {
    const {data: history = [], isPending, error} = useQuery(tariffQueries.history(productId, contractId));

    return {history, isPending, error};
}

export function useTariffDurationsHook(productId: string, contractId: string) {
    const {data: durations = [], isPending, error} = useQuery(tariffQueries.durations(productId, contractId));

    return {durations, isPending, error};
}

export function useTariffGroupHook() {
    const groupsQuery = useTariffGroups();

    const createTariffGroup = useCreateTariffGroup();
    const updateTariffGroup = useUpdateTariffGroup();
    const deleteTariffGroup = useDeleteTariffGroup();

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
        ...groupsQuery,
        ...createTariffGroup,
        ...updateTariffGroup,
        ...deleteTariffGroup,
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
