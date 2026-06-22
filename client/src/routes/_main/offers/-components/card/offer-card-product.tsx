import { Badge } from "@/components";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { OfferPosition } from "@/types";
import { formatEur } from "@/utils/utils";

type Props = {
    position: OfferPosition;
};

export default function OfferCardProduct({ position }: Props) {
    const { product, contract, quantity, duration_months, total_cents } = position;

    const locale = useLocale();

    return (
        <div className="flex items-center justify-between gap-2 py-3 px-4 rounded-md">
            <div className="grid">
                <div className="flex gap-2">
                    <p className="text-md">
                        {localized(product.translations, locale, "name")}
                    </p>
                    <Badge variant="draft">
                        {localized(contract.translations, locale, "name")}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1 text-sm font-light">
                        <span className="text-(--text-secondary)">Seats:</span>
                        <p>{quantity}</p>
                    </div>
                    <div className="flex gap-1 text-sm font-light">
                        <span className="text-(--text-secondary)">Laufzeit:</span>
                        <p>{duration_months} Monate</p>
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