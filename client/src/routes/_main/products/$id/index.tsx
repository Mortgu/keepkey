import {createFileRoute} from "@tanstack/react-router";
import {ProductDetailContainer} from "./-page";

export const Route = createFileRoute("/_main/products/$id/")({
    component: ProductDetailContainer,
});
