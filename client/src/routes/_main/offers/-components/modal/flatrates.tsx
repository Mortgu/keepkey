import { Button } from "@/components";
import { useLocale } from "@/hooks";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { OfferFormApi } from "../../-hooks/use-offer-form";

interface Props {
    form: OfferFormApi;
}

export default function FlatrateOfferModalSection({ form }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();

    return (
        <div className="grid gap-4">
            <hr className="text-(--border)" />

            {/* Head */}
            <div className="flex items-center justify-between">
                <p>Flatrates</p>

                {/* Header actions */}
                <div className="flex items-center gap-4">

                    <Button type="button" variant="link" size="fit_sm"
                        onClick={() => { }} disabled={false}>
                        <Plus size={14} /> {t("offerModal.add_flatrate")}
                    </Button>

                </div>

            </div>

            {offerPositions.length === 0 && !showWorkloadForm && (
                <p className="text-sm text-gray-500 text-center py-4">
                    Noch kein Produkt hinzugefügt
                </p>
            )}
        </div>
    )
}