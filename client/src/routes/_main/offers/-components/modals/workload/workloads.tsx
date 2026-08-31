import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-form";
import { useOfferModalContext } from "../offer-modal-context";
import WorkloadForm from "./workload-form";
import WorkloadItem from "./workload-item";
import { Button, Checkbox, MultiSelectList, Select } from "@/components";
import useOfferModal from "@/routes/_main/offers/-hooks/use-offer.offer-modal";
import useWorkloadOfferModal from "@/routes/_main/offers/-hooks/use-workloads.offer-modal";
import { useContracts, useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";

export default function WorkloadSection() {
    const { t } = useTranslation();
    const locale = useLocale();

    const { contracts } = useContracts();

    const { form, policy, sourceOffer, customerId } = useOfferModalContext();

    const [contract, setContract] = useState<string>(contracts[0].id);

    const featureComparison = useStore(form.store, (s) => s.values.featureComparison);
    const setFeatureComparison = (val: boolean) => form.setFieldValue("featureComparison", val);

    const toCompare = useStore(form.store, (s) => s.values.toCompare);
    const setToCompare = (vals: Array<string>) => form.setFieldValue("toCompare", vals);

    const { compareOptions } = useOfferModal({ currentOffer: sourceOffer });

    const {
        offerPositions,
        addWorkload,
        updateWorkload,
        deleteWorkload,
    } = useWorkloadOfferModal({ customerId, form });

    const [showWorkloadForm, setShowWorkloadForm] = useState<boolean>(false);

    if (policy.positions.access === "hidden") return null;

    // Ein Angebot ohne Position gibt es nicht — die letzte bleibt stehen.
    const canRemove = policy.positions.canRemove && offerPositions.length > 1;
    const showsComparison = policy.featureComparison === "edit";

    return (
        <div className="grid gap-4">

            {/* */}
            <div className="flex items-center justify-center gap-2">
                <Select
                    value={contract}
                    onValueChange={setContract}
                    options={contracts.map(ctr => ({
                        value: ctr.id,
                        label: localized(ctr.translations, locale, "name"),
                    }))}
                />

                <Select
                    value={contract}
                    onValueChange={setContract}
                    options={contracts.map(ctr => ({
                        value: ctr.id,
                        label: localized(ctr.translations, locale, "name"),
                    }))}
                />

            </div>

            {/* Head */}
            <div className="flex items-center justify-between">
                <p>{t("offerModal.workload_section")}</p>

                {/* Header actions */}
                <div className="flex items-center gap-4">

                    {showsComparison && (
                        <Checkbox label={t("offerModal.compare")} checked={featureComparison}
                            onChange={(e) => setFeatureComparison(e.target.checked)} />
                    )}

                    {policy.positions.canAdd && (
                        <Button type="button" variant="link" size="fit_sm"
                            onClick={() => setShowWorkloadForm(true)} disabled={showWorkloadForm}>
                            <Plus size={14} /> {t("offerModal.add_workload")}
                        </Button>
                    )}

                </div>

            </div>

            {showsComparison && featureComparison && (
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
                    <WorkloadForm
                        cancelFn={() => setShowWorkloadForm(false)}
                        saveFn={(v) => addWorkload(v)}
                    />
                </div>
            )}

            {offerPositions.map((workload, index) => (
                <WorkloadItem
                    key={workload.sourcePositionId ?? index}
                    workload={workload}
                    updateFn={(updatedWl) => updateWorkload(index, updatedWl)}
                    deleteFn={canRemove ? () => deleteWorkload(index) : undefined}
                />
            ))}

        </div>
    )
}
