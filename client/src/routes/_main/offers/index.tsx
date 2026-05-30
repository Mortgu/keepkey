import { createFileRoute } from '@tanstack/react-router'
import OfferList from './-components/offer-list'
import { Fragment } from 'react'

export const Route = createFileRoute('/_main/offers/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <Fragment>
            <div className='grid gap-4'>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Angebote</h1>
                </div>

                <OfferList />
            </div>
        </Fragment>
    )
}
