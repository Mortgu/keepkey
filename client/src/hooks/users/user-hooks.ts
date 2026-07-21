import { useQuery } from "@tanstack/react-query";
import { userQueries } from "./user-queries";

const EMPTY_ARRAY: never[] = [];

export function useUsers() {
    const { data = EMPTY_ARRAY, isPending, error } = useQuery(userQueries.list());
    return { users: data, isPending, error };
}
