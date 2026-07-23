import { useTranslation } from "react-i18next";
import type { OfferFormApi } from "../../../-hooks/use-offer-form";
import { Button } from "@/components";
import { Plus } from "lucide-react";

interface Props {
    form: OfferFormApi;
}

export default function DiscoundOfferModalSection({ form }: Props) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-4">
            <hr className="text-(--border)" />

            {/* Head */}
            <div className="flex items-center justify-between">
                <p>{t("offerModal.discound_section")}</p>

                {/* Header actions */}
                <div className="flex items-center gap-4">

                    <Button type="button" variant="link" size="fit_sm"
                        onClick={() => { }} disabled={false}>
                        <Plus size={14} /> {t("offerModal.add_discount")}
                    </Button>

                </div>

            </div>

            <p className="text-sm text-gray-500 text-center py-4">
                Noch kein Rabatt hinzugefügt
            </p>
        </div>
    )
}