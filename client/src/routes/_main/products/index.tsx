import { createFileRoute } from '@tanstack/react-router'
import ProductList from './-components/product-list';

export const Route = createFileRoute('/_main/products/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProductList />;
}
