import { api } from "@/lib/api-client";

export type SearchType = "offer" | "order" | "customer";

export type SearchResultItem = {
    id: string;
    type: SearchType;
    title: string;
    /** Raw value to pass as the list filter's search param. */
    searchValue: string;
    meta: string;
    updatedAt: string;
};

export type SearchResponse = {
    items: Array<SearchResultItem>;
    counts: {
        all: number;
        offer: number;
        order: number;
        customer: number;
    };
};

export const searchAction = (term: string, type?: SearchType) => {
    const params = new URLSearchParams();
    params.set("q", term);
    if (type) params.set("type", type);
    return api<SearchResponse>(`/api/search?${params.toString()}`, { method: "GET" });
};
