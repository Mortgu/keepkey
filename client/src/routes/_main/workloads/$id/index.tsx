import {createFileRoute} from "@tanstack/react-router";
import {ProductDetailContainer} from "./-page";

export const Route = createFileRoute("/_main/workloads/$id/")({
    component: ProductDetailContainer,
});
