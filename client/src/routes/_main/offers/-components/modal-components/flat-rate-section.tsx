import { Button } from "@/components";
import { useFlatRateHook, useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatEur } from "@/utils/utils";
import { Plus, Trash, X } from "lucide-react";
import { useState } from "react";
import OfferFlatRateForm from "./offer-flat-rate-form";
import type { CreateOfferFlatrateInput, OfferFlatRate } from "@/types";

type Props = {
    offerFlatRates: Array<OfferFlatRate>;
    onAdd: (data: CreateOfferFlatrateInput) => void;
    onRemove: (index: number) => void;
};

export default function FlatRateModalSection({
    offerFlatRates,
    onAdd,
    onRemove,
}: Props) {
    const [showForm, setShowForm] = useState(false);
    const { flatRates } = useFlatRateHook();
    const locale = useLocale();

    return (
        <div className="grid gap-4">
            <hr className="text-gray-200" />

            <div className="grid gap-4">
                <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-gray-700">
                        Pauschalen
                    </span>
                    <Button
                        variant="link"
                        size="fit_sm"
                        disabled={showForm}
                        icon={<Plus className="size-4" />}
                        onClick={() => setShowForm(true)}
                    >
                        Pauschale hinzufügen
                    </Button>
                </div>

                {offerFlatRates.length === 0 && !showForm && (
                    <p className="text-sm text-gray-500 text-center py-2">
                        Noch keine Pauschale hinzugefügt
                    </p>
                )}

                <div className="flex flex-col gap-2">
                    {offerFlatRates.map((flatRate, index) => (
                        <div
                            key={`${flatRate.flatRateId}-${index}`}
                            className="flex items-center justify-between bg-(--subtle-50) border border-(--border) px-3 py-2 rounded-md"
                        >
                            <div className="grid">
                                <p className="flex items-center gap-1 text-sm">
                                    {flatRate.quantity}{" "}
                                    <X className="size-3" />{" "}
                                    {localized(
                                        flatRate.flatRate.translations,
                                        locale,
                                        "name",
                                    )}
                                </p>
                                <p className="text-xs text-(--text-secondary)">
                                    {formatEur(flatRate.total_cents)}
                                </p>
                            </div>
                            <Button
                                type="button"
                                size="xs"
                                variant="secondary"
                                icon={<Trash className="size-3" />}
                                iconOnly
                                onClick={() => onRemove(index)}
                            />
                        </div>
                    ))}

                    {showForm && (
                        <OfferFlatRateForm
                            flatRates={flatRates}
                            saveFn={(data) => {
                                onAdd(data);
                                setShowForm(false);
                            }}
                            cancelFn={() => setShowForm(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
