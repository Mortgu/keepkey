import { useTranslation } from "react-i18next";
import OfferVolumeChart from "./-components/charts/offer-volume-chart";
import OffersOrdersChart from "./-components/charts/offers-orders-chart";
import { Breadcrumbs, RouteError, Skeleton } from "@/components";
import { useDashboardStats } from "@/hooks";

export default function DashboardPage() {
    const { t } = useTranslation();
    const { months, isPending: statsPending, error: statsError } = useDashboardStats();

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[{ label: t("nav.dashboard"), to: "/" }]}
                />
            </div>

            {/* Page Header with Title + Actions */}
            <div className="flex items-center justify-between mb-2">
                {/* Title + Description */}
                <div className="grid gap-1">
                    <h1 className="text-xl font-medium">{t("dashboard.title")}</h1>
                    <p className='text-sm text-(--text-secondary)'>{t("dashboard.description")}</p>
                </div>
            </div>

            {/* Kennzahlen der letzten 12 Monate */}
            {statsError && <RouteError error={statsError} />}

            {statsPending && (
                <div className='flex flex-wrap gap-4 mb-6'>
                    <Skeleton className="flex-1 h-80 min-w-[420px]" />
                    <Skeleton className="flex-1 h-80 min-w-[420px]" />
                </div>
            )}

            {!statsPending && !statsError && (
                <div className='flex flex-wrap items-stretch gap-4 mb-6'>
                    <OfferVolumeChart months={months} />
                    <OffersOrdersChart months={months} />
                </div>
            )}

        </div>
    );
}
