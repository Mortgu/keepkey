import { queryOptions } from "@tanstack/react-query";
import { searchAction } from "./search-api";
import { searchKeys } from "./search-keys";
import type { SearchType } from "@keepit/schemas";

export const searchQueries = {
    query: (term: string, type?: SearchType) => queryOptions({
        queryKey: searchKeys.query(term, type),
        queryFn: () => searchAction(term, type),
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    }),
};
