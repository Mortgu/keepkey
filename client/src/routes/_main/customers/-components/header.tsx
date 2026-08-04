import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components";

interface Props {
    onCreate: () => void;
}

export default function CustomerPageHeader({ onCreate }: Props) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-4 px-8 py-6 border-b border-(--border)">
            <div className="flex items-center justify-between">
                <div className="flex-1 grid gap-1">
                    <h1 className="font-medium text-xl">Kunden</h1>
                    <p className="font-light text-sm text-gray-400">
                        Zentrale Kundenakte — Vorgänge anlegen, Stammdaten pflegen, Verlängerungen im Blick behalten.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {/* <Button icon={<Download size={14} />} variant="border" size="sm">
                        {t("button.export")}
                    </Button>*/}
                    <Button
                        icon={<Plus size={14} strokeWidth={3} />}
                        variant="primary"
                        size="sm"
                        onClick={onCreate}
                    >
                        {t("customer.create")}
                    </Button>
                </div>
            </div>
        </div>
    )
}