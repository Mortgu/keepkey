import { createFileRoute } from "@tanstack/react-router";
import FlatRateList from "./-components/flatrate-list";
import { PageWidth } from "@/components";

export const Route = createFileRoute("/_main/products/flatrates")({
  component: () => (
    <PageWidth variant="full">
      <FlatRateList />
    </PageWidth>
  ),
});
