import { useTranslation } from "react-i18next";
import OfferVolumeChart from "./-components/charts/offer-volume-chart";
import IntegrationCard from "./-components/integration-card";
import OffersOrdersChart from "./-components/charts/offers-orders-chart";
import type { IntegrationCardMeta, IntegrationStatus } from "./-components/integration-card";
import type { IntegrationEntry } from "@keepit/schemas";
import { useIntegrationStatus } from "@/hooks/integrations/integration-hooks";
import { useDashboardStats } from "@/hooks";
import { Breadcrumbs, RouteError, Skeleton } from "@/components";

const CHECKING_STATUS: IntegrationStatus = "checking";

function toMeta(meta: Record<string, string> | undefined): Array<IntegrationCardMeta> | undefined {
    if (!meta) return undefined;
    return Object.entries(meta).map(([label, value]) => ({ label, value }));
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const { months, isPending: statsPending, error: statsError } = useDashboardStats();
    const { data, isPending, isFetching, error, refetch } = useIntegrationStatus();

    const renderCard = (
        name: string,
        entry: IntegrationEntry | undefined,
    ) => {
        const status: IntegrationStatus = isPending || !entry
            ? CHECKING_STATUS
            : entry.status;
        return (
            <IntegrationCard
                name={name}
                status={status}
                meta={toMeta(entry?.meta)}
                onRetry={refetch}
                isRetrying={isFetching}
            />
        );
    };

    if (error) {
        return <RouteError error={error} onRetry={refetch} />
    }

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[{ label: "Dashboard", to: "/" }]}
                />
            </div>

            {/* Page Header with Title + Actions */}
            <div className="flex items-center justify-between mb-2">
                {/* Title + Description */}
                <div className="grid gap-1">
                    <h1 className="text-xl font-medium">Overview</h1>
                    <p className='text-sm text-gray-500'>Todo: Write a short page description text here</p>
                </div>
            </div>

            {/* Integrations (Status + Infos) */}
            <div className='flex flex-wrap items-start gap-4 mb-4'>
                {renderCard("NextCloud", data?.nextcloud)}
                {renderCard("Redis", data?.redis)}
                {renderCard("S3 Storage", data?.s3)}
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
