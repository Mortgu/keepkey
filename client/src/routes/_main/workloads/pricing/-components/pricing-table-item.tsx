import { ChevronDown } from "lucide-react";
import { useState } from "react";
import TariffComponent from "./tariff-component";
import type { TariffBase } from "@keepit/schemas";
import { Button } from "@/components";
import { useLocale } from "@/hooks";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/i18n-content";

type Props = {
    tariff: TariffBase;
}

export default function PricingTableItem({ tariff }: Props) {
    const locale = useLocale();

    const [open, setOpen] = useState<boolean>(false);

    const contract = tariff.contract;

    return (
        <div>
            <div className="flex items-center justify-between border-b border-(--border) last:border-none">
                <div className="w-full px-4 py-2 hover:bg-(--page-bg) cursor-pointer select-none"
                    onClick={() => setOpen(!open)}>
                    <div className="flex items-center gap-4">
                        <Button size="fit_xs" variant="link" icon={<ChevronDown className="size-4" />} iconOnly />
                        <div>
                            <p>{localized(contract.translations, locale, "name")}</p>
                            <p className="text-sm text-(--text-secondary)">{formatDate(tariff.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {open && (
                <TariffComponent tariff={tariff} />
            )}
        </div>
    )
}
