import type { SearchResponse, SearchType } from "@keepit/schemas";
import { api } from "@/lib/api-client";

export const searchAction = (term: string, type?: SearchType) => {
    const params = new URLSearchParams();
    params.set("q", term);
    if (type) params.set("type", type);
    return api<SearchResponse>(`/api/search?${params.toString()}`, { method: "GET" });
};
