import { createFileRoute } from "@tanstack/react-router";
import { OrderPage } from "./-page";

export const Route = createFileRoute("/_main/orders/")({
  component: OrderPage,
});
