import { createFileRoute } from '@tanstack/react-router'
import OrderList from './-components/order-list'

export const Route = createFileRoute('/_main/orders/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="grid gap-4">
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Bestellungen</h1>
            </div>

            <OrderList />
        </div>
    )
}
