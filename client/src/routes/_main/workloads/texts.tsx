import { createFileRoute } from "@tanstack/react-router";
import { TextsPage } from "./texts.component";

export const Route = createFileRoute("/_main/workloads/texts")({
    component: TextsPage,
});
