import {createFileRoute} from '@tanstack/react-router'
import ProductList from "@/routes/-components/product-list.tsx";
import ContractList from "@/routes/user/_pathlessLayout/admin/-components/contract-list.tsx";

export const Route = createFileRoute('/user/_pathlessLayout/admin/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className='grid gap-8'>
            {/* Contracts */}
            <ContractList />

            <ProductList />
        </div>
    );
}
