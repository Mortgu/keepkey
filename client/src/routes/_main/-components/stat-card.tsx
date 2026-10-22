import { useTranslation } from "react-i18next";
import { useFormatters } from "@/hooks";

interface Props {
    title: string;
    total: number;
    volume: number;
}

export default function StatCard({ title, total, volume }: Props) {
    const { t } = useTranslation();
    const { formatEur } = useFormatters();
    return (
        <div className="flex-1 grid gap-2 py-3 px-4">
            <div className="flex items-center">
                <p className="text-lg font-semibold">{title}</p>
            </div>

            <div className="flex items-center gap-8">
                <div className="grid gap-1">
                    <span className="text-sm text-(--text-secondary)">{t("dashboard.statCard.total")}</span>
                    <p className="text-2xl font-semibold font-mono">
                        {total}
                    </p>
                </div>
                <div className="grid gap-1">
                    <span className="text-sm text-(--text-secondary)">{t("dashboard.statCard.volume")}</span>
                    <p className="text-2xl font-semibold font-mono">
                        {formatEur(volume)}
                    </p>
                </div>
            </div>
        </div>
    )
}