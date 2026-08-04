import { useQuery } from "@tanstack/react-query";
import { tariffQueries } from "./tariff-queries";

export function useTariffGroups() {
    const { data: groups = [], isPending, error } = useQuery(tariffQueries.groups());

    return { groups, isPending, error };
}

export function useTariffVersionsHook(groupId: string, tariffId: string) {
    const { data: versions = [], isPending, error } = useQuery(tariffQueries.versions(groupId, tariffId));
    return { versions, isPending, error };
}

export function useTariffDurationsHook(productId: string, contractId: string) {
    const { data: durations = [], isPending, error } = useQuery(tariffQueries.durations(productId, contractId));

    return { durations, isPending, error };
}

