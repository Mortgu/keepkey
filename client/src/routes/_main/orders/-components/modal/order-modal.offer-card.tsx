import { Dot } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Offer } from "@keepit/schemas";
import { Badge } from "@/components";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";

interface Props {
    offer: Offer;
    selected: boolean;
    onSelect: (offer: Offer) => void;
}

const isExpired = (offer: Offer) =>
    Boolean(offer.validUntil) && new Date(offer.validUntil!).getTime() < Date.now();

/** Ein Angebot in der Auswahlliste des Dialogs „Bestellung anlegen“. */
export default function OrderModalOfferCard({ offer, selected, onSelect }: Props) {
    const { t } = useTranslation();
    const ccp = offer.customerContactPerson;

    return (
        <button
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onSelect(offer)}
            className={[
                "grid w-full gap-1 p-3 text-left rounded-md border cursor-pointer transition-colors",
                selected
                    ? "border-(--primary-600) bg-(--primary-50)"
                    : "border-transparent hover:bg-(--page-bg)",
            ].join(" ")}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-sm text-(--text-secondary) shrink-0">AG{offer.quoteId}</span>
                    <span className="font-medium truncate">{offer.customer.companyName}</span>
                </div>
                <span className="font-mono text-sm font-medium shrink-0">{formatEur(offer.net_amount)}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-(--text-secondary)">
                <span>{ccp.firstName} {ccp.lastName}</span>
                <Dot size={16} />
                <span>{t("orders.modal.from", { date: formatDate(offer.createdAt) })}</span>
                {offer.derivationType === "RENEWAL" && <Badge variant="GENERATED" size="xs">{t("derived.badge_renewal")}</Badge>}
                {offer.derivationType === "LICENSE_EXTENSION" && <Badge variant="GENERATED" size="xs">{t("derived.badge_extension")}</Badge>}
                {isExpired(offer) && <Badge variant="FAILED" size="xs">{t("orders.modal.expired")}</Badge>}
            </div>
        </button>
    );
}
