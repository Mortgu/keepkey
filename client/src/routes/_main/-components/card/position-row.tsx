import type { Contract, OfferPosition, OrderPosition } from "@keepit/schemas";
import { Badge } from "@/components";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";

type Props = {
    position: OfferPosition | OrderPosition;
    /**
     * Vertrag und Laufzeit gehören dem Beleg, nicht der Position — alle
     * Positionen eines Angebots teilen sie. Die Zeile zeigt sie trotzdem, damit
     * sie für sich lesbar bleibt.
     */
    contract: Contract;
    durationMonths: number;
};

/**
 * Eine Produktzeile in Angebots- und Bestellkarte. `OrderPosition` ist
 * `OfferPosition` ohne Freimonate — der Rabattblock entfällt dort deshalb.
 */
export default function PositionRow({ position, contract, durationMonths }: Props) {
    const { product, quantity, total_cents } = position;

    const locale = useLocale();

    const freeMonths = "free_months" in position ? position.free_months : 0;
    const discountCents = "discount_cents" in position ? position.discount_cents : 0;
    const unitCents = "eur_user_month" in position ? position.eur_user_month : 0;

    return (
        <div className="grid gap-4 border-b border-(--border) py-3 last:border-0">
            <div className="flex items-center justify-between gap-2">
                <div className="grid gap-1">
                    <div className="flex gap-2">
                        <p className="text-md">
                            {localized(product.translations, locale, "name")}
                        </p>
                        <Badge variant="GENERATED">
                            {localized(contract.translations, locale, "name")}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 text-sm font-light">
                            <span className="text-(--text-secondary)">Seats:</span>
                            <p>{quantity}</p>
                        </div>
                        <div className="flex gap-1 text-sm font-light">
                            <span className="text-(--text-secondary)">Stückpreis:</span>
                            <p>{formatEur(unitCents)}</p>
                        </div>
                        <div className="flex gap-1 text-sm font-light">
                            <span className="text-(--text-secondary)">Laufzeit:</span>
                            <p>{durationMonths} Monate</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-md font-mono">{formatEur(total_cents)}</p>
                </div>
            </div>

            {freeMonths > 0 && (
                <div className="flex items-center justify-between gap-2">
                    <div className="grid">
                        <div className="flex gap-2">
                            <p className="text-md">
                                Freimonate für {localized(product.translations, locale, "name")}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 text-sm font-light">
                                <span className="text-(--text-secondary)">Seats:</span>
                                <p>{quantity}</p>
                            </div>
                            <div className="flex gap-1 text-sm font-light">
                                <span className="text-(--text-secondary)">Laufzeit:</span>
                                <p>{freeMonths} Monate</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-md font-normal font-mono">{formatEur(-discountCents)}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
