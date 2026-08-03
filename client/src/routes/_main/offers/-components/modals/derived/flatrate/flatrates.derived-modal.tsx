import { useStore } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import FlatrateItemDerivedModal from "./flatrate-item.derived-modal";
import type { OfferFlatrate } from "@keepit/schemas";
import type { DerivedFormApi } from "../hook/use-derived-form";

interface Props {
    form: DerivedFormApi;
    originalFlatrates: Array<OfferFlatrate>;
}

export default function FlatratesDerivedModal({ form, originalFlatrates }: Props) {
    const { t } = useTranslation();
    const flatrates = useStore(form.store, (s) => s.values.flatrates);

    return (
        <div className="grid gap-4 my-4">
            <hr className="text-(--border)" />

            <div className="flex items-center justify-between">
                <p>{t("offerModal.flatrate_section")}</p>
            </div>

            {flatrates.length === 0 && (
                <div className="flex items-center justify-center w-full">
                    <p className="text-gray-400 font-light">Keine Flatrate vorhanden</p>
                </div>
            )}

            <div className="grid gap-2">
                {flatrates.map((_, index) => (
                    <FlatrateItemDerivedModal
                        key={index}
                        form={form}
                        index={index}
                        originalFlatrate={originalFlatrates[index]}
                    />
                ))}
            </div>
        </div>
    );
}