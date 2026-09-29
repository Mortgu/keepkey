import { useQuery } from "@tanstack/react-query";
import { searchQueries } from "./search-queries";
import type { SearchType } from "@keepit/schemas";

type UseSearchOptions = {
    enabled?: boolean;
};

export const useSearch = (term: string, type?: SearchType, options?: UseSearchOptions) => {
    const trimmed = term.trim();
    const enabled = trimmed.length > 0 && (options?.enabled ?? true);

    const query = useQuery({
        ...searchQueries.query(trimmed, type),
        enabled,
    });

    return {
        data: query.data,
        isPending: query.isPending,
        isFetching: query.isFetching,
        error: query.error,
    };
};
