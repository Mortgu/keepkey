import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { Cloud } from "lucide-react";
import { DashboardSection } from "./dashboard-section";
import { StatCardGrid } from "./stat-card-grid";
import { RecentOffersWidget } from "./recent-offers-widget";
import { RecentOrdersWidget } from "./recent-orders-widget";
import type {IntegrationStatus} from "@/components";
import { useNextcloudStatus } from "@/hooks/nextcloud-hook";
import {  IntegrationStatusCard, PageWidth } from "@/components";

export function DashboardPage() {
    const { t } = useTranslation();
    const { status, detail, isPending, refetch } = useNextcloudStatus();

    return (
        <PageWidth>
            <Fragment>
                <div className="grid gap-6">
                    <StatCardGrid />

                    <div className="grid lg:grid-cols-2 gap-6">
                        <DashboardSection
                            title={t("dashboard.recentOffers")}
                            action={{ to: "/offers", label: t("dashboard.viewAll") }}
                        >
                            <RecentOffersWidget />
                        </DashboardSection>

                        <DashboardSection
                            title={t("dashboard.recentOrders")}
                            action={{ to: "/orders", label: t("dashboard.viewAll") }}
                        >
                            <RecentOrdersWidget />
                        </DashboardSection>
                    </div>

                    <DashboardSection title={t("dashboard.integrations")}>
                        <IntegrationStatusCard
                            name="Nextcloud"
                            icon={<Cloud className="size-5" />}
                            status={
                                (isPending ? "checking" : status) as IntegrationStatus
                            }
                            detail={detail}
                            onRetry={() => refetch()}
                        />
                    </DashboardSection>
                </div>
            </Fragment>
        </PageWidth>
    );
}
