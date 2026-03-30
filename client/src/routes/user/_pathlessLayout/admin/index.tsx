import { createFileRoute, notFound } from '@tanstack/react-router'
import ContractList from "@/routes/user/_pathlessLayout/admin/-components/contract-list.tsx";
import ProductList from "@/routes/user/_pathlessLayout/admin/-components/product-list.tsx";
import OrderList from './-components/order-list';
import ToggleSlider from '@/components/inputs/toggle-slider';

export const Route = createFileRoute('/user/_pathlessLayout/admin/')({
    component: RouteComponent,
    beforeLoad: async ({ context }: any) => {
        const { data: session } = await context.auth.getSession();
        console.log(session);

        if (!session || session.user.role !== "admin") {
            throw notFound({
                data: session
            });
        }
    },
    notFoundComponent: ({ data }) => {
        return (
            <div className='p-4 bg-gray-100 rounded-md border border-gray-200'>
                <p>Diese Seite existiert nicht.</p>
                <p>{JSON.stringify(data)}</p>
            </div>
        )
    }
})

function RouteComponent() {
    return (
        <div className='grid gap-8'>
            {/*<div className='grid gap-4 rounded-md border border-gray-200 p-3'>
                <div className='flex items-center justify-between'>
                    <p>Require E-Mail verification</p>
                    <ToggleSlider checked={true} />
                </div>
                <div className='flex items-center justify-between '>
                    <p>Require E-Mail verification</p>
                    <ToggleSlider checked={true} />
                </div>
            </div>*/}

            {/* Contracts */}
            <ContractList />

            <ProductList />

            <OrderList />
        </div>
    );
}
