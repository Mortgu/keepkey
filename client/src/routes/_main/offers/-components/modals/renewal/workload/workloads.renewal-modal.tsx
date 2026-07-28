import { useLocale } from "@/hooks";
import type { OfferPosition } from "@keepit/schemas";
import { t } from "i18next";
import WorkloadItemRenewalModal from "./workload-item.renewal-modal";

interface Props {
    customerId: string;
    workloads: Array<OfferPosition>;
}

export default function WorkloadRenewalModal({ customerId, workloads }: Props) {
    const locales = useLocale();

    return (
        <div className="grid gap-4 my-4">
            <hr className="text-(--border)" />

            {/* Workloads Head */}
            <div className="flex items-center justify-between">
                <p>{t("offerModal.workload_section")}</p>
            </div>

            {/* Workloads */}
            <div className="grid gap-2">
                {workloads.map(workload => (
                    <WorkloadItemRenewalModal
                        customerId={customerId}
                        workload={workload}
                    />
                ))}
            </div>
        </div>
    )
}