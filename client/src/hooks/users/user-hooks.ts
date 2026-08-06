import { useQuery } from "@tanstack/react-query";
import { userQueries } from "./user-queries";
import type { UserFilterParams } from "@keepit/schemas";

const EMPTY_ARRAY: Array<never> = [];

export function useUsers(filters: UserFilterParams = {}) {
    const { data = EMPTY_ARRAY, isPending, error } = useQuery(userQueries.list(filters));
    return { users: data, isPending, error };
}
