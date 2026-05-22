import { createFileRoute } from "@tanstack/react-router";
import FlatRateList from "./-components/flatrate-list";

export const Route = createFileRoute("/_main/products/flatrates")({
  component: RouteComponent,
});

function RouteComponent() {
  return <FlatRateList />;
}
