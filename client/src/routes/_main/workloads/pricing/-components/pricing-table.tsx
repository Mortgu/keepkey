import { Plus } from "lucide-react";
import PricingTableItem from "./pricing-table-item";
import type { TariffGroup } from "@/types";
import { Button } from "@/components";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatDate } from "@/lib/format";

type Props = {
    group: TariffGroup;
}

export default function PricingTable({ group }: Props) {
    const locale = useLocale();

    return (
        <div className="border border-(--border) rounded-md overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-(--border) bg-(--page-bg)">
                <div>
                    <p className="text-md font-normal flex gap-1">
                        {group.products.map((gp, idx) => (
                            <span key={gp.productId}>
                                {idx > 0 && ", "}
                                <span className="hover:underline cursor-pointer">
                                    {localized(gp.product.translations, locale, "name")}
                                </span>
                            </span>
                        ))}
                    </p>
                    <p className="text-sm text-(--text-secondary)">{formatDate(group.createdAt)}</p>
                </div>

                <div>
                    <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />} iconOnly />
                </div>
            </div>

            <div className="grid">
                {group.tariffs.map(tariff => (
                    <PricingTableItem key={tariff.id} tariff={tariff} />
                ))}
            </div>
        </div>
    );
}
