import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { OfferFlatRate } from "@/types"
import { formatEur } from "@/utils/utils";

type Props = {
    flatrate: OfferFlatRate;
}

export default function OfferCardFlatRate({ flatrate }: Props) {
    const { flatRate, quantity, total_cents } = flatrate;

    const locale = useLocale();

    return (
        <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="grid">
                <p className="text-md">
                    {localized(flatRate.translations, locale, "name")}
                </p>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1 text-sm font-light">
                        <span className="text-(--text-secondary)">Anzahl:</span>
                        <p>{quantity}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <p className="text-md font-semibold">{formatEur(total_cents)}</p>
                <p className="text-(--text-secondary) font-light text-sm">
                    Gesamtpreis (netto)
                </p>
            </div>
        </div>
    )
}