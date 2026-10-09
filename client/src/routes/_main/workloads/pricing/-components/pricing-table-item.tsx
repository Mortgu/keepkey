import { ChevronDown, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import TariffComponent from "./tariff-component";
import type { TariffBase } from "@keepit/schemas";
import { Button, showToast } from "@/components";
import { useLocale } from "@/hooks";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/i18n-content";
import { useDeleteTariff } from "@/hooks/tariffs/tariff-mutations";

type Props = {
    tariff: TariffBase;
}

export default function PricingTableItem({ tariff }: Props) {
    const locale = useLocale();
    const { t } = useTranslation();
    const { deleteTariff, isPending: deleting } = useDeleteTariff();

    const [open, setOpen] = useState<boolean>(false);

    const contract = tariff.contract;
    const contractName = localized(contract.translations, locale, "name");

    const handleDelete = () => {
        if (!confirm(t("workloads.pricing.delete.confirm", { name: contractName, count: tariff.cells.length }))) return;

        // Schlägt das Entfernen fehl (z. B. wegen offener Angebote), zeigt der globale onError-Handler die Server-Meldung.
        deleteTariff(
            { groupId: tariff.tariffGroupId, tariffId: tariff.id },
            { onSuccess: () => showToast.success("workloads.pricing.delete.done", { vars: { name: contractName } }) },
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between border-b border-(--border) last:border-none">
                <div className="w-full px-4 py-2 hover:bg-(--page-bg) cursor-pointer select-none"
                    onClick={() => setOpen(!open)}>
                    <div className="flex items-center gap-4">
                        <Button size="fit_xs" variant="link" icon={<ChevronDown className="size-4" />} iconOnly />
                        <div>
                            <p>{contractName}</p>
                            <p className="text-sm text-(--text-secondary)">{formatDate(tariff.createdAt)}</p>
                        </div>
                    </div>
                </div>

                <div className="px-2 py-2 border-l border-(--border)">
                    <Button size="sm" variant="secondary" icon={<Trash className="size-3.5" />} iconOnly
                        title={t("workloads.pricing.delete.title")}
                        onClick={handleDelete}
                        loading={deleting} disabled={deleting} />
                </div>
            </div>

            {open && (
                <TariffComponent tariff={tariff} />
            )}
        </div>
    )
}
