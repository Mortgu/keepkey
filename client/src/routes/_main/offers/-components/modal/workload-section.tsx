import { Button, Checkbox } from "@/components";
import { useTranslation } from "react-i18next";
import type useOfferFormState from "../../-hooks/use-offer-form-state";
import { Plus } from "lucide-react";

interface Props {
    state: ReturnType<typeof useOfferFormState>;

}

export default function WorkloadSection(props: Props) {
    const { state } = props;
    const { t } = useTranslation();

    const { featureComparison, toggleFeatureComparison } = state;

    return (
        <div className="grid gap-4">
            {/* Seperator line */}
            <hr className="text-(--border)" />

            {/* Head */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-(--text)">Workloads</span>

                    {/* feature comparison toggle */}
                    <Checkbox label={t("offerModal.compare")} checked={featureComparison}
                        onChange={(e) => toggleFeatureComparison(e.target.checked)} />
                </div>

                {/* */}
                <Button variant="link" size="fit_sm"
                    icon={<Plus className="size-4" />}>Workload hinzufügen</Button>
            </div>

            {/* Body */}

            {/* Empty message */}


        </div>
    )
}
