import { createFileRoute } from '@tanstack/react-router'
import OfferList from './-components/offer-list'

export const Route = createFileRoute('/admin/_adminLayout/offers/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <OfferList />
}
