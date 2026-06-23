import { createFileRoute } from "@tanstack/react-router";
import CustomerList from "./-components/customer-list";
import { PageWidth } from "@/components";

export const Route = createFileRoute("/_main/customers/")({
  component: () => (
    <PageWidth>
      <CustomerList />
    </PageWidth>
  ),
});
