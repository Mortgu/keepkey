import { createFileRoute } from '@tanstack/react-router'
import OfferList from './-components/offer-list'

export const Route = createFileRoute('/_main/offers/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <OfferList />
}
