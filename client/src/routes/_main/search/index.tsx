import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import SearchPage from "./-page";

/** Der Suchbegriff steht in der URL, damit eine Suche teilbar und wiederholbar ist. */
const searchSchema = z.object({
    q: z.string().optional(),
});

export const Route = createFileRoute("/_main/search/")({
    validateSearch: searchSchema,
    component: SearchPage,
});
