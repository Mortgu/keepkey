import { createFileRoute } from "@tanstack/react-router";
import DashboardPage from "./-page";

export const Route = createFileRoute("/_main/")({
    component: DashboardPage,
});
