import { createFileRoute } from "@tanstack/react-router";
import EmployeeList from "./-components/employee-list";
import { PageWidth } from "@/components";

export const Route = createFileRoute("/_main/employees/")({
    component: () => (
        <PageWidth>
            <EmployeeList />
        </PageWidth>
    ),
});
