import { z } from "zod";
import { isoDateTime } from "./common.js";

export const searchTypeSchema = z.enum(["offer", "order", "customer"]);
export type SearchType = z.infer<typeof searchTypeSchema>;

export const searchResultItemSchema = z.object({
    id: z.string(),
    type: searchTypeSchema,
    title: z.string(),
    /** Rohwert für den `search`-Filterparameter der Liste (quoteId, orderId, companyName). */
    searchValue: z.string(),
    meta: z.string(),
    updatedAt: isoDateTime,
});
export type SearchResultItem = z.infer<typeof searchResultItemSchema>;

export const searchResponseSchema = z.object({
    items: z.array(searchResultItemSchema),
    counts: z.object({
        all: z.number(),
        offer: z.number(),
        order: z.number(),
        customer: z.number(),
    }),
});
export type SearchResponse = z.infer<typeof searchResponseSchema>;
