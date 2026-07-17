import IntegrationCard from "./-components/integration-card";
import GlobalSearch from "./-components/global-search";
import type { IntegrationCardMeta, IntegrationStatus } from "./-components/integration-card";
import type { IntegrationEntry } from "@/data/integrations";
import { PageWidth, RouteError } from "@/components";
import { useIntegrationStatus } from "@/hooks/use-integration-status";
import { useDashboardStats } from "@/hooks";
import StatCard from "./-components/stat-card";
import { useTranslation } from "react-i18next";

const CHECKING_STATUS: IntegrationStatus = "checking";

function toMeta(meta: Record<string, string> | undefined): Array<IntegrationCardMeta> | undefined {
    if (!meta) return undefined;
    return Object.entries(meta).map(([label, value]) => ({ label, value }));
}

export default function DashboardPage() {
    const { t } = useTranslation();
    const { stats } = useDashboardStats();
    const { data, isPending, isFetching, error, refetch } = useIntegrationStatus();

    console.log(stats)

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

            {/* <div className="grid">
                <div className="m-4 flex flex-wrap items-center gap-4">
                    <Button size="md">Button md</Button>
                    <Button size="md" icon={<Plus size={18} />}>Button md</Button>
                    <Button size="md" icon={<Plus size={18} />} iconOnly />
                    <Button size="md" variant="primary" loading>Button xs</Button>

                    <Button size="md" variant="secondary">Button md</Button>
                    <Button size="md" variant="border">Button md</Button>
                    <Button size="md" variant="ghost">Button md</Button>

                    <Button size="md" variant="primary" danger>Button xs</Button>
                    <Button size="md" variant="secondary" danger>Button xs</Button>
                    <Button size="md" variant="border" danger>Button xs</Button>
                </div>

                <div className="m-4 flex flex-wrap items-center gap-4">
                    <Button size="sm">Button sm</Button>
                    <Button size="sm" icon={<Plus size={16} />}>Button sm</Button>
                    <Button size="sm" icon={<Plus size={16} />} iconOnly />
                    <Button size="sm" variant="primary" loading>Button xs</Button>

                    <Button size="sm" variant="secondary">Button sm</Button>
                    <Button size="sm" variant="border">Button sm</Button>
                    <Button size="sm" variant="ghost">Button sm</Button>

                    <Button size="sm" variant="primary" danger>Button xs</Button>
                    <Button size="sm" variant="secondary" danger>Button xs</Button>
                    <Button size="sm" variant="border" danger>Button xs</Button>

                </div>

                <div className="m-4 flex flex-wrap items-center gap-4">
                    <Button size="xs">Button xs</Button>
                    <Button size="xs" icon={<Plus size={14} />}>Button xs</Button>
                    <Button size="xs" icon={<Plus size={14} />} iconOnly />
                    <Button size="xs" variant="primary" loading>Button xs</Button>

                    <Button size="xs" variant="secondary">Button xs</Button>
                    <Button size="xs" variant="border">Button xs</Button>
                    <Button size="xs" variant="ghost">Button xs</Button>

                    <Button size="xs" variant="primary" danger>Button xs</Button>
                    <Button size="xs" variant="secondary" danger>Button xs</Button>
                    <Button size="xs" variant="border" danger>Button xs</Button>


                </div>
            </div>*/}
        </PageWidth>
    );
}
