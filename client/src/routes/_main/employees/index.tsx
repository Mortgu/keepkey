import { createFileRoute } from "@tanstack/react-router";
import EmployeePage from "./-page";
import { requireAdmin } from "@/lib/session";

export const Route = createFileRoute("/_main/employees/")({
    beforeLoad: ({ context }) => requireAdmin(context),
    component: EmployeePage,
});
