import { createFileRoute } from '@tanstack/react-router'
import ProductList from './-components/product-list';
import ContractList from '@/routes/admin/_adminLayout/products/-components/contract-list';
import SupplierList from './-components/supplier-list';

export const Route = createFileRoute('/admin/_adminLayout/products/')({
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
