import { useStore } from "@tanstack/react-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import WorkloadItemDerivedModal from "./workload-item.derived-modal";
import type { OfferPosition } from "@keepit/schemas";
import type { DerivedFormApi, DerivedMode } from "../hook/use-derived-form";

interface Props {
    form: DerivedFormApi;
    mode: DerivedMode;
    offerId: string;
    customerId: string;
    workloads: Array<OfferPosition>;
}

export default function WorkloadDerivedModal({ form, mode, offerId, customerId, workloads }: Props) {
    const { t } = useTranslation();

    const positions = useStore(form.store, (s) => s.values.offerPositions);

    /**
     * Die Quellpositionen werden per Index mit den Formularpositionen gepaart.
     * Beim Entfernen müssen deshalb beide Listen im Gleichschritt schrumpfen —
     * sonst zeigt jede nachfolgende Zeile die Vorher-Werte ihrer Nachbarin.
     */
    const [sources, setSources] = useState<Array<OfferPosition>>(workloads);

    const handleRemove = (index: number) => {
        form.removeFieldValue("offerPositions", index);
        setSources((current) => current.filter((_, i) => i !== index));
    };

    return (
        <div className="grid gap-4 my-4">
            <hr className="text-(--border)" />

            <div className="flex items-center justify-between">
                <p>{t("offerModal.workload_section")}</p>
            </div>

            <div className="grid gap-2">
                {positions.map((_, index) => (
                    <WorkloadItemDerivedModal
                        key={sources[index]?.id ?? index}
                        form={form}
                        mode={mode}
                        offerId={offerId}
                        index={index}
                        customerId={customerId}
                        originalPosition={sources[index]}
                        onRemove={positions.length > 1 ? () => handleRemove(index) : undefined}
                    />
                ))}
            </div>
        </div>
    );
}
