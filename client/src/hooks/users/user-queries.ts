import { queryOptions } from "@tanstack/react-query";
import { getUsers } from "./user-api";
import { userKeys } from "./user-keys";
import type { UserFilterParams } from "@keepit/schemas";

export const userQueries = {
    list: (filters: UserFilterParams = {}) => queryOptions({
        queryKey: userKeys.list(filters),
        queryFn: () => getUsers(filters),
    }),
};
