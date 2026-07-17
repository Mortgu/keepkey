import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { OrderPage } from "./-page";

const orderSearchSchema = z.object({
    search: z.string().optional(),
});

export const Route = createFileRoute("/_main/orders/")({
    validateSearch: orderSearchSchema,
    component: OrderPage,
});
