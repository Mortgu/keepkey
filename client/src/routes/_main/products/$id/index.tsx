import { createFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "./-page";

export const Route = createFileRoute("/_main/products/$id/")({
  component: ProductDetailPage,
});
