import { Pen, Trash } from "lucide-react";
import PricingTableItem from "./pricing-table-item";
import type { TariffGroup } from "@/types";
import { Button } from "@/components";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatDate } from "@/lib/format";
import { useDeleteTariffGroup } from "@/hooks/tariffs/tariff-mutations";
import { useEffect } from "react";
import { toast } from "react-toastify";

type Props = {
    group: TariffGroup;
}

export default function PricingTable({ group }: Props) {
    const locale = useLocale();

    const { deleteTariffGroup, deleteTariffGroupPending, deleteTariffGroupError } = useDeleteTariffGroup();

    useEffect(() => {
        if (deleteTariffGroupError) {
            toast.error(deleteTariffGroupError.message);
        }
    }, [deleteTariffGroupError]);

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

                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" icon={<Pen className="size-3.5" />} iconOnly />
                    <Button size="sm" variant="secondary" icon={<Trash className="size-3.5" />} iconOnly
                        onClick={() => deleteTariffGroup({ id: group.id })} loading={deleteTariffGroupPending} disabled={deleteTariffGroupPending} />
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
