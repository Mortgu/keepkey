import { useQuery } from "@tanstack/react-query";
import type {SearchResponse, SearchType} from "@/data/search";
import {   searchAction } from "@/data/search";

export const searchKeys = {
    all: ["search"] as const,
    query: (term: string, type?: SearchType) =>
        [...searchKeys.all, term, type ?? "all"] as const,
};

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
