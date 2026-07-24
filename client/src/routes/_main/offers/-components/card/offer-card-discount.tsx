import type { OfferDiscount } from "@keepit/schemas";
import { formatEur } from "@/utils/utils";

type Props = {
    discount: OfferDiscount;
};

export default function OfferCardDiscount({ discount }: Props) {
    const { title, description, amount_cents } = discount;

    return (
        <div className="flex items-center justify-between gap-2 py-3 border-b border-(--border) last:border-0">
            <div className="grid">
                <div className="flex gap-2">
                    <p className="text-md">{title}</p>
                    <p className="text-xs text-(--text-secondary)">{description}</p>
                </div>
                <div className="flex items-center gap-2">

                </div>
            </div>
            <div className="flex flex-col items-end">
                <p className="text-md font-mono">{formatEur(-amount_cents)}</p>

            </div>
        </div>
    )
}