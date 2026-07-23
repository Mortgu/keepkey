import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-form";
import useOfferModal from "../../-hooks/use-offer.offer-modal";
import useWorkloadOfferModal from "../../-hooks/use-workloads.offer-modal";
import WorkloadFormOfferModal from "./workload-form";
import WorkloadItemOfferModal from "./workload-item";
import type { OfferFormApi } from "../../-hooks/use-offer-form";
import type { Offer } from "@/types";
import { Button, Checkbox, MultiSelectList } from "@/components";

interface Props {
    customerId: string;
    currentOffer?: Offer;
    form: OfferFormApi;
}

export default function WorkloadOfferModalSection({ customerId, currentOffer, form }: Props) {
    const { t } = useTranslation();

    const featureComparison = useStore(form.store, (s) => s.values.featureComparison);
    const setFeatureComparison = (val: boolean) => form.setFieldValue("featureComparison", val);

    const toCompare = useStore(form.store, (s) => s.values.toCompare);
    const setToCompare = (vals: Array<string>) => form.setFieldValue("toCompare", vals);

    const {
        compareOptions,
    } = useOfferModal({ currentOffer });

    const {
        offerPositions,
        addWorkload,
        updateWorkload,
        deleteWorkload,
        persistCustomerOverride,
    } = useWorkloadOfferModal({ customerId, form });

    const [showWorkloadForm, setShowWorkloadForm] = useState<boolean>(false);


    return (
        <div className="grid gap-4">
            <hr className="text-(--border)" />

            {/* Head */}
            <div className="flex items-center justify-between">
                <p>Workloads</p>

                {/* Header actions */}
                <div className="flex items-center gap-4">

                    <Checkbox label={t("offerModal.compare")} checked={featureComparison} onChange={(e) => setFeatureComparison(e.target.checked)} />

                    <Button type="button" variant="link" size="fit_sm"
                        onClick={() => setShowWorkloadForm(true)} disabled={showWorkloadForm}>
                        <Plus size={14} /> {t("offerModal.add_workload")}
                    </Button>

                </div>

            </div>

            {featureComparison && (
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
                        customerId={customerId}
                        onPersistOverride={persistCustomerOverride}
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