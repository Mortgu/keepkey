import { createFileRoute } from "@tanstack/react-router";
import { Cloud } from "lucide-react";
import { IntegrationStatusCard, type IntegrationStatus } from "@/components";
import { Fragment, useState } from "react";
import NextCloudSettingsModal from "./-components/nextcloud-settings-modal";
import { useNextcloudStatus } from "@/hooks/nextcloud-hook";

export const Route = createFileRoute("/_main/")({
    component: RouteComponent,
});

function RouteComponent() {
    const [nextCloudSettingsOpen, setNextCloudSettingsOpen] = useState<boolean>(false);
    const { status, detail, isPending, refetch } = useNextcloudStatus();

    return (
        <Fragment>
            <div className="grid gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-xs font-medium text-[#8A9E93] uppercase tracking-wide">Integrations</h2>
                    <div className="flex flex-col gap-2">
                        <IntegrationStatusCard
                            name="Nextcloud"
                            icon={<Cloud className="size-5" />}
                            status={(isPending ? "checking" : status ?? "not_configured") as IntegrationStatus}
                            detail={detail}
                            onRetry={() => refetch()}
                            onSettings={() => setNextCloudSettingsOpen(true)}
                        />
                    </div>
                </div>
            </div>

            <NextCloudSettingsModal open={nextCloudSettingsOpen} cancelFn={() => setNextCloudSettingsOpen(false)} />
        </Fragment>
    );
}
