import { useQuery } from "@tanstack/react-query";
import { userQueries } from "./user-queries";
import { getSessionUser } from "./user-api";
import { userKeys } from "./user-keys";
import type { UserFilterParams } from "@keepit/schemas";

const EMPTY_ARRAY: Array<never> = [];

export function useUsers(filters: UserFilterParams = {}) {
    const { data = EMPTY_ARRAY, isPending, error } = useQuery(userQueries.list(filters));
    return { users: data, isPending, error };
}

/** Die Session des eingeloggten Users — Grundlage des `AuthProvider`. */
export function useSessionUser() {
    const { data = null, isLoading, refetch } = useQuery({
        queryKey: userKeys.session(),
        queryFn: getSessionUser,
        retry: false,
    });
    return { user: data, isLoading, refetch };
}
