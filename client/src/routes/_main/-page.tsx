import { useTranslation } from "react-i18next";
import IntegrationCard from "./-components/integration-card";
import type { IntegrationCardMeta, IntegrationStatus } from "./-components/integration-card";
import type { IntegrationEntry } from "@keepit/schemas";
import { useIntegrationStatus } from "@/hooks/integrations/integration-hooks";
import { useDashboardStats } from "@/hooks";
import GlobalSearch from "./-components/global-search";
import { Button, RouteError } from "@/components";

const CHECKING_STATUS: IntegrationStatus = "checking";

function toMeta(meta: Record<string, string> | undefined): Array<IntegrationCardMeta> | undefined {
    if (!meta) return undefined;
    return Object.entries(meta).map(([label, value]) => ({ label, value }));
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const { stats } = useDashboardStats();
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
        <div className="mx-4">
            {/* Global Page Header with Global Search + Breadcrumbs */}
            <div className="flex items-center justify-between border-b border-(--border) h-16">
                <GlobalSearch />
            </div>

            {/* Page Header with Title + Actions */}
            <div className="flex items-center justify-between my-6">
                {/* Title + Description */}
                <div className="grid gap-1">
                    <h1 className="text-xl font-medium">Overview</h1>
                    <p className='text-sm text-gray-500'>Todo: Write a short page description text here</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Example Button */}
                    <Button size="sm">Angebot erstellen</Button>
                </div>
            </div>

            {/* Integrations (Status + Infos) */}
            <div className='flex items-start gap-4 mb-4'>
                {renderCard("NextCloud", data?.nextcloud)}
                {renderCard("Redis", data?.redis)}
                {renderCard("S3 Storage", data?.s3)}
            </div>

        </div>
    );
}
