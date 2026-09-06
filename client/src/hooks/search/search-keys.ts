import type { SearchType } from "@keepit/schemas";

export const searchKeys = {
    all: ["search"] as const,
    query: (term: string, type?: SearchType) =>
        [...searchKeys.all, term, type ?? "all"] as const,
};
