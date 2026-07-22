import { Button, Checkbox, MultiSelectList } from "@/components";
import { useLocale } from "@/hooks";
import type { Offer } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useOfferModal from "../../-hooks2/use-offer.offer-modal";
import useWorkloadOfferModal from "../../-hooks2/use-workloads.offer-modal";
import WorkloadFormOfferModal from "./workload-form";
import WorkloadItemOfferModal from "./workload-item";

interface Props {
    customerId: string;
    currentOffer?: Offer;
}

export default function WorkloadOfferModalSection({ customerId, currentOffer }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();

    const {
        compare,
        setCompare,
        compareOptions,
        toCompare,
        setToCompare
    } = useOfferModal({ currentOffer });

    const {
        offerPositions,
        addWorkload,
        updateWorkload,
        deleteWorkload,
    } = useWorkloadOfferModal({ currentOffer, customerId });

    const [showWorkloadForm, setShowWorkloadForm] = useState<boolean>(false);


    return (
        <div className="grid gap-4">
            <hr className="text-(--border)" />

            {/* Head */}
            <div className="flex items-center justify-between">
                <p>Workloads</p>

                {/* Header actions */}
                <div className="flex items-center gap-4">

                    <Checkbox label={t("offerModal.compare")} checked={compare} onChange={(e) => setCompare(e.target.checked)} />

                    <Button type="button" variant="link" size="fit_sm"
                        onClick={() => setShowWorkloadForm(true)} disabled={showWorkloadForm}>
                        <Plus size={14} /> {t("offerModal.add_workload")}
                    </Button>

                </div>

            </div>

            {compare && (
                <MultiSelectList
                    options={compareOptions}
                    onChange={(c) => setToCompare(c)}
                    values={toCompare}
                />
            )}

            {offerPositions.length === 0 && !showWorkloadForm && (
                <p className="text-sm text-gray-500 text-center py-4">
                    Noch kein Produkt hinzugefügt
                </p>
            )}

            {showWorkloadForm && (
                <div className="grid bg-(--subtle-50) border border-(--border) rounded-md">
                    <WorkloadFormOfferModal
                        cancelFn={() => setShowWorkloadForm(false)}
                        saveFn={(v) => addWorkload(v)}
                    />
                </div>
            )}

            {offerPositions.map((workload, index) => (
                <WorkloadItemOfferModal
                    updateFn={(workload) => updateWorkload(index, workload)}
                    deleteFn={() => deleteWorkload(index)}
                    customerId={customerId}
                    workload={workload}
                />
            ))}

        </div>
    )
}