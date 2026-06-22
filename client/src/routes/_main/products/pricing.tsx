import {createFileRoute} from "@tanstack/react-router";
import {Fragment} from "react";

export const Route = createFileRoute("/_main/products/pricing")({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <Fragment>

        </Fragment>
    );
}
