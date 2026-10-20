import { RouteError } from "@/components";
import { useConfirmation, useCustomer, useInvoice, useOffer, useOrder } from "@/hooks";
import { useTranslation } from "react-i18next";
import FlowDetailView from "./-components/flow-detail-view";
import { Route } from "./index";

/** Seite eines Vorgangs — `flowId` ist die Angebots-Id. */
export default function FlowPage() {
    const { t } = useTranslation();
    const { customerId, flowId } = Route.useParams();

    const { customer } = useCustomer(customerId);
    const { offer, isPending, error } = useOffer(flowId);
    const { order } = useOrder(offer?.order?.id ?? "");
    const { confirmation } = useConfirmation(offer?.order?.id ?? "");
    const { invoice } = useInvoice(offer?.order?.id ?? "");

    if (error) {
        return (
            <div className="mx-4">
                <RouteError error={error} />
            </div>
        );
    }

    if (isPending || !offer) {
        return (
            <div className="mx-4 p-4">{t("common.loading")}</div>
        );
    }

    return (
        <FlowDetailView
            offer={offer}
            order={order ?? null}
            confirmation={confirmation ?? null}
            invoice={invoice ?? null}
            customerId={customerId}
            customer={customer}
        />
    );
}
