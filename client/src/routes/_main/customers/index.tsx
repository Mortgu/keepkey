import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import CustomerList from "./-components/customer-list";
import { PageWidth } from "@/components";

const customerSearchSchema = z.object({
    search: z.string().optional(),
});

export const Route = createFileRoute("/_main/customers/")({
    validateSearch: customerSearchSchema,
    component: () => (
        <PageWidth>
            <CustomerList />
        </PageWidth>
    ),
});
