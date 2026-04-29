import { createFileRoute } from '@tanstack/react-router'
import ProductList from './-components/product-list';
import SupplierList from './-components/supplier-list';
import FlatRateList from './-components/flatrate-list';

export const Route = createFileRoute('/_main/products/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='grid gap-8'>
      <ProductList />
      <FlatRateList />
      <SupplierList />
    </div>
  );
}
