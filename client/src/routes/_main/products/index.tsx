import { createFileRoute } from '@tanstack/react-router'
import ProductList from './-components/product-list';
import SupplierList from './-components/supplier-list';
import ContractList from './-components/contract-list';

export const Route = createFileRoute('/_main/products/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='grid gap-8'>
      <ContractList />
      <ProductList />
      <SupplierList />
    </div>
  );
}
