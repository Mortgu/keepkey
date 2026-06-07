import { createFileRoute } from "@tanstack/react-router";
import { OfferPage } from "./-page";

export const Route = createFileRoute("/_main/offers/")({
  component: OfferPage,
});
