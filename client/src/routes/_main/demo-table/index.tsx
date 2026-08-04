import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import DataTableDemo from "./-page";

const searchSchema = z.object({});

export const Route = createFileRoute("/_main/demo-table/")({
    validateSearch: searchSchema,
    component: DataTableDemo,
});
