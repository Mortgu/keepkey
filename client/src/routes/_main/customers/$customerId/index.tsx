import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import CustomerDetailPage from "./-page";

const customerDetailSearchSchema = z.object({
    tab: z.enum(["general", "flow", "prices"]).catch("general").default("general"),
});

export const Route = createFileRoute("/_main/customers/$customerId/")({
    validateSearch: customerDetailSearchSchema,
    component: CustomerDetailPage,
});
