import { useTranslation } from "react-i18next";
import { FileText, FolderOpen, Percent, ShoppingCart } from "lucide-react";
import { StatCard } from "@/components";
import { useDashboardStats } from "@/hooks";
import { formatEur } from "@/utils/utils";

const ICON_SIZE = "size-5";

export function StatCardGrid() {
    const { t } = useTranslation();
    const { stats, isPending } = useDashboardStats();

    const conversionPct = `${Math.round(stats.conversionRate * 100)} %`;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <StatCard
                label={t("dashboard.stats.offerVolume")}
                value={formatEur(stats.openOfferVolumeCents)}
                icon={<FileText className={ICON_SIZE} />}
                isLoading={isPending}
                to="/offers"
            />
            <StatCard
                label={t("dashboard.stats.openOffers")}
                value={stats.openOfferCount}
                icon={<FolderOpen className={ICON_SIZE} />}
                isLoading={isPending}
                to="/offers"
            />
            <StatCard
                label={t("dashboard.stats.orders")}
                value={stats.orderCount}
                icon={<ShoppingCart className={ICON_SIZE} />}
                isLoading={isPending}
                to="/orders"
            />
            <StatCard
                label={t("dashboard.stats.conversion")}
                value={conversionPct}
                icon={<Percent className={ICON_SIZE} />}
                isLoading={isPending}
            />
        </div>
    );
}
