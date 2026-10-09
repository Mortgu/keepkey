import FlowDetailView from "./-components/flow-detail-view";
import { Route } from "./index";
import { RouteError } from "@/components";
import { useCustomer, useOffer, useOrder } from "@/hooks";

/** Seite eines Vorgangs — `flowId` ist die Angebots-Id. */
export default function FlowPage() {
    const { customerId, flowId } = Route.useParams();
    const { customer } = useCustomer(customerId);
    const { offer, isPending, error } = useOffer(flowId);
    const { order } = useOrder(offer?.order?.id ?? "");

    if (error) return <div className="mx-4"><RouteError error={error} /></div>;
    if (isPending || !offer) return <div className="mx-4 p-4">Lädt…</div>;

    return (
        <FlowDetailView
            offer={offer}
            order={order ?? null}
            customerId={customerId}
            customer={customer}
        />
    );
}
