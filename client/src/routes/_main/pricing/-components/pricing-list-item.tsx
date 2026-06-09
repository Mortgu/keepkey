import { Badge, Button } from "@/components";
import { useLocale } from "@/hooks";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/i18n-content";
import type { Language, Tariff } from "@/types";
import { formatEur } from "@/utils/utils";
import { Pen, Trash } from "lucide-react";

type Props = {
    tariff: Tariff;
};

function tariffTitle(tariff: Tariff, locale: Language): string {
    if (tariff.products.length === 0) return "(keine Produkte)";
    return tariff.products.map((p) => localized(p.translations, locale, "name")).join(" & ");
}

export default function PricingListItem({ tariff }: Props) {
    const locale = useLocale();

    console.log(tariff);

    return (
        <div className="border border-(--border) rounded-lg">
            {/* header */}
            <div className="flex items-center justify-between py-2 pl-4 pr-2">
                <div className="grid">
                    <p>{tariffTitle(tariff, locale)}</p>
                    <p className="text-sm text-(--text-secondary)">{formatDate(tariff.createdAt)}</p>
                </div>

                {/* header actions */}
                <div className="flex items-center gap-2">

                    {/* edit action */}
                    <Button variant="secondary" size="sm" icon={<Pen className="size-3.5" />} iconOnly />

                    {/* delete action */}
                    <Button variant="secondary" size="sm" icon={<Trash className="size-3.5" />} iconOnly />
                </div>
            </div>

            {/* body */}
            <div>
                {/* body table header */}
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center px-4 py-1.5 border border-(--border) bg-(--page-bg)">
                    <span className="text-caption text-gray-400">Vertrag</span>
                    <span className="text-caption text-gray-400">Menge</span>
                    <span className="text-caption text-gray-400">Laufzeit</span>
                    <span className="text-caption text-gray-400">Preis</span>
                    <span />
                </div>

                {/* body table content */}
                {tariff.configs.map((config) => (
                    <div key={config.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center px-4 py-2.5 border-b border-(--border)">
                        <Badge variant="generated">{localized(config.contract?.translations, locale, "name")}</Badge>
                        <p className="text-sm text-gray-600">{config.min_quantity} – {config.max_quantity ?? "∞"}</p>
                        <p className="text-sm text-gray-600">{config.duration} Monate</p>
                        <p className="text-sm text-gray-600">{formatEur(config.price)}</p>
                        <div className="flex items-center justify-end">
                            <Button variant="link" size="xs" icon={<Trash className="size-3.5" />} iconOnly />
                        </div>
                    </div>
                ))}

            </div>
        </div>
    )
}