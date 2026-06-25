import { Badge } from "@/components";
import { useOffers } from "@/hooks/offers/offer-hooks";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";
import { useTranslation } from "react-i18next";
import { RecentActivityRow } from "./recent-activity-row";

const LIMIT = 3;

export function RecentOffersWidget() {
    const { t } = useTranslation();

    const { offers, isPending } = useOffers({
        sort: "createdAt:desc"
    });

    const recent = offers.slice(0, LIMIT);

    return (
        <div className="border border-(--border) rounded-md bg-white">
            {isPending ? (
                <p className="text-sm text-(--text-secondary) px-4 py-3">
                    {t("common.loading")}
                </p>
            ) : recent.length === 0 ? (
                <p className="text-sm text-(--text-secondary) px-4 py-3">
                    {t("dashboard.noActivity")}
                </p>
            ) : (
                recent.map((offer) => (
                    <RecentActivityRow
                        key={offer.id}
                        title={offer.customer.companyName}
                        subtitle={offer.quoteId}
                        amount={formatEur(offer.net_amount)}
                        date={formatDate(offer.createdAt)}
                        badge={
                            offer.orders ? (
                                <Badge variant="generated">
                                    {t("dashboard.badge.converted")}
                                </Badge>
                            ) : undefined
                        }
                    />
                ))
            )}
        </div>
    );
}
