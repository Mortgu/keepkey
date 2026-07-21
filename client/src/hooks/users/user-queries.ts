import { queryOptions } from "@tanstack/react-query";
import { getUsers } from "./user-api";
import { userKeys } from "./user-keys";

export const userQueries = {
    list: () => queryOptions({
        queryKey: userKeys.list(),
        queryFn: getUsers,
    }),
};
