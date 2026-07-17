import { ChevronDown, Plus, UndoDot } from "lucide-react";
import { useEffect, useState } from "react";
import TariffComponent from "./tariff-component";
import type { Tariff } from "@/types";
import { Button, Drawer } from "@/components";
import { useLocale } from "@/hooks";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/i18n-content";
import { useCreateTariff } from "@/hooks/tariffs/tariff-mutations";
import { toast } from "react-toastify";

type Props = {
    tariff: Tariff;
}

export default function PricingTableItem({ tariff }: Props) {
    const locale = useLocale();

    const [open, setOpen] = useState<boolean>(false);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    const { createTariff, createTariffPending, createTariffError } = useCreateTariff();

    const contract = tariff.contract;

    useEffect(() => {
        if (createTariffError) {
            toast.error(createTariffError.message);
        }
    }, [createTariffError])

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
                        onClick={() => setDrawerOpen(true)} />
                    <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />} iconOnly
                        onClick={() => createTariff({ groupId: tariff.tariffGroupId, input: { contractId: tariff.contractId } })}
                        loading={createTariffPending} disabled={createTariffPending} />
                </div>
            </div>

            {open && (
                <TariffComponent tariff={tariff} />
            )}

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} wide>
                <Drawer.Header eyebrow="" title="History"
                    subtitle="Vergangene Preistabellen" />
                <Drawer.Body>
                </Drawer.Body>
            </Drawer>
        </div>
    )
}
