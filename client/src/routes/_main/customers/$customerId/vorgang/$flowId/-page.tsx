import { useTranslation } from "react-i18next";
import { Route } from "./index";
import { Breadcrumbs, RouteError, Spinner } from "@/components";
import { useConfirmation, useCustomer, useInvoice, useOffer, useOrder } from "@/hooks";

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
            <div className="mx-4 p-4"><Spinner /></div>
        );
    }

    return (
        <div className="grid gap-5 mx-4 pb-10">
            <div className="flex h-14 items-center border-b border-(--border)">
                <Breadcrumbs size="sm" maxItems={4} items={[
                    { label: t("nav.dashboard"), to: "/" },
                    { label: t("section.customers"), to: "/customers" },
                    { label: customer?.companyName ?? "...", to: "/customers/$customerId", params: { customerId } },
                    { label: offer.quoteId ?? "..." },
                ]} />
            </div>



        </div>
    );
}
