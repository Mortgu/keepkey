import { createFileRoute } from '@tanstack/react-router'
import ContractList from "@/routes/user/_pathlessLayout/admin/-components/contract-list.tsx";
import ProductList from "@/routes/user/_pathlessLayout/admin/-components/product-list.tsx";
import OrderList from './-components/order-list';

export const Route = createFileRoute('/user/_pathlessLayout/admin/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className='grid gap-8'>
            {/* Contracts */}
            <ContractList />

            <ProductList />

            <OrderList />
        </div>
    );
}
