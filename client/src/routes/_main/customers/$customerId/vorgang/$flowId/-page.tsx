import { Breadcrumbs, RouteError, Spinner } from "@/components";
import { useConfirmation, useCustomer, useFormatters, useInvoice, useLocale, useOffer, useOrder } from "@/hooks";
import FlowDetailView from "./-components/flow-detail-view";
import { Route } from "./index";
import { localized } from "@/lib/i18n-content";
import { useTranslation } from "react-i18next";
import { derivePhase, deriveStages } from "../../-components/flow/flow-derive";

/** Seite eines Vorgangs — `flowId` ist die Angebots-Id. */
export default function FlowPage() {
    const { customerId, flowId } = Route.useParams();
    const { t } = useTranslation();
    const locale = useLocale();

    const { formatEur } = useFormatters();

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

    const stages = deriveStages(offer);
    const phase = derivePhase(offer, stages);

    const positions = offer.offerPositions
        .map((p) => localized(p.product.translations, locale, "name"))
        .join(", ");

    return (
        <div className="grid gap-5 mx-4 pb-10">

            <div className="flex h-14 items-center border-b border-(--border)">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: t("nav.dashboard"), to: "/" },
                        { label: t("section.customers"), to: "/customers" },
                        { label: customer?.companyName ?? "…", to: "/customers/$customerId", params: { customerId } },
                        { label: positions || `AG${offer.quoteNumber}` },
                    ]}
                />
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
                        {`${offer.contactPerson.firstName} ${offer.contactPerson.lastName}`.trim()} · {t(`flows.phase.${phase}`)}
                    </p>
                </div>
                <div className="w-fit text-right h-full flex flex-col justify-between">
                    <p className="text-xl font-mono font-medium tabular-nums">{formatEur(offer.net_amount)}</p>
                    <p className="text-xs text-(--fg-3)">{t("flows.detail.net")}</p>
                </div>
            </div>

            <FlowDetailView
                offer={offer}
                order={order ?? null}
                confirmation={confirmation ?? null}
                invoice={invoice ?? null}
            />
        </div>
    );
}
