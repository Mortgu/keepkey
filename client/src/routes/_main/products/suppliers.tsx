import { createFileRoute } from "@tanstack/react-router";
import SupplierList from "./-components/supplier-list";

export const Route = createFileRoute("/_main/products/suppliers")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SupplierList />;
}
