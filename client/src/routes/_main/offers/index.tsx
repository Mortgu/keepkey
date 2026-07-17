import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { OfferPage } from "./-page";

const offerSearchSchema = z.object({
    search: z.string().optional(),
});

export const Route = createFileRoute("/_main/offers/")({
    validateSearch: offerSearchSchema,
    component: OfferPage,
});
