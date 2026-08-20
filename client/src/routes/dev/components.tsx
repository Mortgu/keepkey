import { createFileRoute } from "@tanstack/react-router";
import { ComponentMatrix } from "./-page";

export const Route = createFileRoute("/dev/components")({
    component: ComponentMatrix,
});
