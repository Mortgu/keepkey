import { useQuery } from "@tanstack/react-query";
import { searchAction } from "./search-api";
import { searchKeys } from "./search-keys";
import type { SearchResponse, SearchType } from "@keepit/schemas";

type UseSearchOptions = {
    enabled?: boolean;
};

export const useSearch = (term: string, type?: SearchType, options?: UseSearchOptions) => {
    const trimmed = term.trim();
    const enabled = trimmed.length > 0 && (options?.enabled ?? true);

    const query = useQuery<SearchResponse>({
        queryKey: searchKeys.query(trimmed, type),
        queryFn: () => searchAction(trimmed, type),
        enabled,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    return {
        data: query.data,
        isPending: query.isPending,
        isFetching: query.isFetching,
        error: query.error,
    };
};
