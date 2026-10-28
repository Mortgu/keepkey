import { useTranslation } from "react-i18next";
import { Route } from "./index";
import { Breadcrumbs, RouteError, Spinner } from "@/components";
import { useCustomer, useFormatters, useLocale, useOffer } from "@/hooks";
import { formatEur } from "@/lib/format";
import { localized } from "@/lib/i18n-content";
import { Dot } from "lucide-react";
import FlowSummary from "./-components/flow-summary";
import OfferSection from "./-components/offer-section";

export default function FlowPage() {
    const { t } = useTranslation();
    const locale = useLocale();

    const { customerId, offerId } = Route.useParams();

    const { customer } = useCustomer(customerId);
    const { offer, isPending, error } = useOffer(offerId);

    const { formatDate } = useFormatters();

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

    const offerPositionNames = offer.offerPositions
        .map((position) => localized(position.product.translations, locale, "name"))
        .join(", ");

    const customerFullName = `${offer.customerContactPerson.salutation} ${offer.customerContactPerson.firstName} ${offer.customerContactPerson.lastName}`;

    return (
        <div className="grid gap-5 mx-4 pb-10">

            {/* Top Breadcrumbs */}
            <div className="flex h-14 items-center border-b border-(--border)">
                <Breadcrumbs size="sm" maxItems={4} items={[
                    { label: t("nav.dashboard"), to: "/" },
                    { label: t("section.customers"), to: "/customers" },
                    { label: customer?.companyName ?? "...", to: "/customers/$customerId", params: { customerId } },
                    { label: offer.quoteId ?? "..." },
                ]} />
            </div>

            {/* Header main infos */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-(--border) pb-5">
                <div className="grid gap-1">
                    <h1 className="text-xl font-medium">{offerPositionNames}</h1>
                    {/*<h1 className="text-xl font-mono">
                        <span className="font-normal text-(--fg-3)">AG</span>
                        <span className="font-medium">{offer.quoteId}</span>
                    </h1>*/}
                    <div className="flex items-center justify-center gap-1 text-(--fg-3) text-sm">
                        <p className="">
                            {customerFullName}
                        </p>
                        <Dot size={14} />
                        <p className="">
                            {formatDate(offer.date)}
                        </p>
                    </div>
                </div>
                <div className="grid gap-1 text-right">
                    <p className="text-xl font-medium font-mono tabular-nums">{formatEur(offer.net_amount, offer.language)}</p>
                    <p className="text-sm  text-(--fg-3) tabular-nums">{t("flows.detail.net")}</p>
                </div>
            </div>

            <div className="grid w-full items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="grid gap-4">
                    <OfferSection offer={offer} />
                </div>

                <FlowSummary offer={offer} customer={offer.customer} />
            </div>

        </div>
    );
}
