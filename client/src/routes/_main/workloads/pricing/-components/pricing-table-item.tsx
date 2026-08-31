import { BookmarkPlus, ChevronDown, UndoDot } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import TariffComponent from "./tariff-component";
import { TariffVersionList } from "./tariff-version-list";
import type { TariffBase, TariffTier } from "@keepit/schemas";
import { Button, Drawer } from "@/components";
import { useLocale } from "@/hooks";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/i18n-content";
import { useSealTariffVersion } from "@/hooks/tariffs/tariff-mutations";

type Props = {
    tariff: TariffBase;
    /** Die Staffeln der Gruppe — die Mengenachse gehört ihr, nicht dem Tarif. */
    tiers: Array<TariffTier>;
}

export default function PricingTableItem({ tariff, tiers }: Props) {
    const locale = useLocale();

    const [open, setOpen] = useState<boolean>(false);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    const { sealVersion, isPending: sealingVersion, error: errorSealingVersion } = useSealTariffVersion();

    const contract = tariff.contract;

    useEffect(() => {
        if (errorSealingVersion) {
            toast.error(errorSealingVersion.message);
        }
    }, [errorSealingVersion])

    const handleSeal = async () => {
        const version = await sealVersion({ groupId: tariff.tariffGroupId, tariffId: tariff.id });
        toast.success(`Version ${version.version} gespeichert.`);
        setDrawerOpen(true);
    };

    return (
        <div>
            <div className="flex items-center justify-between border-b border-(--border) last:border-none">
                <div className="w-full px-4 py-2 hover:bg-(--page-bg) cursor-pointer border-r border-(--border) select-none"
                    onClick={() => setOpen(!open)}>
                    <div className="flex items-center gap-4">
                        <Button size="fit_xs" variant="link" icon={<ChevronDown className="size-4" />} iconOnly />
                        <div>
                            <p>{localized(contract.translations, locale, "name")}</p>
                            <p className="text-sm text-(--text-secondary)">{formatDate(tariff.createdAt)}</p>
                        </div>
                    </div>
                </div>

                <div className="px-2 py-2 flex items-center gap-2">
                    <Button size="sm" variant="secondary" icon={<UndoDot className="size-3.5" />} iconOnly
                        title="Versionshistorie"
                        onClick={() => setDrawerOpen(true)} />
                    <Button size="sm" variant="secondary" icon={<BookmarkPlus className="size-3.5" />} iconOnly
                        title="Aktuellen Stand als Version speichern"
                        onClick={handleSeal}
                        loading={sealingVersion} disabled={sealingVersion} />
                </div>
            </div>

            {open && (
                <TariffComponent tariff={tariff} tiers={tiers} />
            )}

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} wide>
                <Drawer.Header eyebrow={localized(contract.translations, locale, "name")} title="Versionen"
                    subtitle="Frühere Stände dieser Preistabelle" />
                <Drawer.Body>
                    {drawerOpen && (
                        <TariffVersionList groupId={tariff.tariffGroupId} tariffId={tariff.id} />
                    )}
                </Drawer.Body>
            </Drawer>
        </div>
    )
}
