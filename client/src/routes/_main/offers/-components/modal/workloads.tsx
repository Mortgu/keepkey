import { Button, Checkbox, MultiSelectList } from "@/components";
import type { Offer } from "@/types";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useCompareOfferModal from "../../-hooks2/use-compare.offer-modal";
import OfferProductForm from "../modal-components/offer-product-form";

interface Props {
    customerId: string;
    currentOffer?: Offer;
}

export default function WorkloadOfferModalSection({ customerId, currentOffer }: Props) {
    const { t } = useTranslation();

    const {
        compare,
        setCompare,
        compareOptions,
        toCompare,
        setToCompare
    } = useCompareOfferModal({ currentOffer: currentOffer });

    const [addWorkload, setAddWorkload] = useState<boolean>(false);


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
                        onClick={() => setAddWorkload(true)} disabled={addWorkload}>
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

            {addWorkload && (
                <div className="grid bg-(--subtle-50) border-b border-r border-l border-(--border) rounded-md">
                    <OfferProductForm
                        customerId={customerId}
                        onSave={(data) => console.log(data)}
                        onCancel={() => setAddWorkload(false)}
                    />
                </div>
            )}


        </div>
    )
}