import { createFileRoute } from "@tanstack/react-router";
import { EmployeePage } from "./-page";

export const Route = createFileRoute("/_main/employees/")({
  component: EmployeePage,
});
