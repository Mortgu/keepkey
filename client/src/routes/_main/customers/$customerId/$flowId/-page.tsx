import { Breadcrumbs, RouteError } from "@/components";
import { useCustomer, useFormatters, useLocale, useOffer } from "@/hooks";
import { useTranslation } from "react-i18next";
import { Route } from "./index";
import { LoaderCircle } from "lucide-react";
import { localized } from "@/lib/i18n-content";
import OfferCard from "@/components/modules/offer/offer-card";
import FlowSummary from "./-components/flow-summary";
import OrderCard from "@/components/modules/order/order-card";

/* /customers/:customerId/:flowId */
export default function FlowPage() {
    const { customerId, flowId } = Route.useParams();

    const { t } = useTranslation();
    const locale = useLocale();

    const { formatDate, formatEur } = useFormatters();

    const { customer, isPending: customerPending, error: customerError } = useCustomer(customerId);
    const { offer, isPending: offerPending, error: offerError } = useOffer(flowId);

    if (offerPending || customerPending) {
        return (
            <LoaderCircle className="size-4 animate-spin" />
        )
    }

    if (customerError || offerError) {
        console.error(customerError);
        console.error(offerError);

        return (
            <>
                {offerError?.message}
                {customerError?.message}
            </>
        )
    }

    if (!offer || !customer) {
        return (
            <RouteError error={<>Not found</>} />
        )
    }

    const positions = offer.offerPositions
        .map((p) => localized(p.product.translations, locale, "name"))
        .join(", ");

    return (
        <div className="grid gap-5 mx-4 pb-10">

            {/* Top Breadcrumbs */}
            <div className="flex h-14 items-center border-b border-(--border)">
                <Breadcrumbs size="sm" maxItems={4} items={[
                    { label: t("nav.dashboard"), to: "/" },
                    { label: t("section.customers"), to: "/customers" },
                    { label: customer?.companyName ?? "...", to: "/customers/$customerId", params: { customerId } },
                    { label: `AG${offer.quoteNumber}` || "..." },
                ]} />
            </div>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-(--border)">
                <div className="flex-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-medium">{positions || `AG${offer.quoteNumber}`}</h1>
                        {offer.derivationType && (
                            <span className="rounded bg-(--subtle-50) px-1.5 py-px text-xs text-(--fg-2)">
                                {t(`flows.derivation.${offer.derivationType}`)}
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-(--fg-3)">
                        {`${offer.contactPerson.firstName} ${offer.contactPerson.lastName}`.trim()} · {formatDate(offer.createdAt)}
                    </p>
                </div>
                <div className="w-fit text-right h-full flex flex-col justify-between">
                    <p className="text-xl font-mono font-medium tabular-nums">{formatEur(offer.net_amount)}</p>
                    <p className="text-sm text-(--fg-3)">{t("flows.detail.net")}</p>
                </div>
            </div>


            <div className="grid w-full items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="grid gap-4">
                    <OfferCard offerId={flowId} />
                    <OrderCard orderId={flowId} />
                </div>

                <FlowSummary offer={offer} customer={offer.customer} />
            </div>

        </div>
    )
}