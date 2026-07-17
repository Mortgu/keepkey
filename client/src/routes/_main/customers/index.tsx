import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import CustomerPage from "./-page";

const customerSearchSchema = z.object({
    search: z.string().optional(),
});

export const Route = createFileRoute("/_main/customers/")({
    validateSearch: customerSearchSchema,
    component: CustomerPage
});
