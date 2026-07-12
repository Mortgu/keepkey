import { Button, Checkbox } from "@/components";
import { useTranslation } from "react-i18next";
import type useOfferFormState from "../../-hooks/use-offer-form-state";
import { Plus } from "lucide-react";
import type { Contract, Product } from "@/types";
import { useMemo } from "react";

interface Props {
    state: ReturnType<typeof useOfferFormState>;

    products: Array<Product>;
    contracts: Array<Contract>;
}

export default function WorkloadSection(props: Props) {
    const { state, products, contracts } = props;
    const { t } = useTranslation();

    const { featureComparison, toggleFeatureComparison } = state;

    const productMap = useMemo(
        () => new Map(products.map((p) => [p.id, p])),
        [products],
    );
    const contractMap = useMemo(
        () => new Map(contracts.map((c) => [c.id, c])),
        [contracts],
    );

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