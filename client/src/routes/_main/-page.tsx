import { useTranslation } from "react-i18next";
import IntegrationCard from "./-components/integration-card";
import GlobalSearch from "./-components/global-search";
import StatCard from "./-components/stat-card";
import type { IntegrationCardMeta, IntegrationStatus } from "./-components/integration-card";
import type { IntegrationEntry } from "@/data/integrations";
import { PageWidth, RouteError } from "@/components";
import { useIntegrationStatus } from "@/hooks/integrations/integration-hooks";
import { useDashboardStats } from "@/hooks";

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

    return (
        <PageWidth variant="none">
            <div className="w-full bg-(--page-bg) border-b border-(--border) p-4">
                <GlobalSearch />
            </div>

            {error ? (
                <RouteError error={error} onRetry={refetch} />
            ) : (
                <div className="grid grid-cols-3 border-b border-(--border) [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-(--border)">
                    {renderCard("NextCloud", data?.nextcloud)}
                    {renderCard("Redis", data?.redis)}
                    {renderCard("S3 Storage", data?.s3)}
                </div>
            )}

            <div className="flex border-b border-(--border) [&>*:not(:last-child)]:border-r [&>*:not(:last-child)]:border-(--border) overflow-y-scroll">
                <StatCard
                    title={t("section.offers")}
                    total={stats.offers.total}
                    volume={stats.offers.volume}
                />

                <StatCard
                    title={t("section.orders")}
                    total={stats.orders.total}
                    volume={stats.orders.volume}
                />
            </div>

        </PageWidth>
    );
}
