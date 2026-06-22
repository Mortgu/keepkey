import {createFileRoute} from "@tanstack/react-router";
import {CreateOfferPage} from "./-page";

export const Route = createFileRoute("/_main/offers/create/")({
    component: CreateOfferPage,
});
