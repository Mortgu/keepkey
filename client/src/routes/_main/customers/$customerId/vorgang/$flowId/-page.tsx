import { getMockFlow } from "../../-components/flow/flow-mock";
import FlowDetailView from "./-components/flow-detail-view";
import { Route } from "./index";
import { RouteError } from "@/components";
import { useCustomer } from "@/hooks";

/** DESIGN-PROTOTYP — Seite eines Vorgangs. Daten kommen aus `flow-mock.ts`. */
export default function FlowPage() {
    const { customerId, flowId } = Route.useParams();
    const { customer } = useCustomer(customerId);

    const flow = getMockFlow(flowId);
    if (!flow) return <div className="mx-4"><RouteError error={new Error("Vorgang nicht gefunden")} /></div>;

    return <FlowDetailView flow={flow} customerId={customerId} customerName={customer?.companyName ?? "…"} />;
}
