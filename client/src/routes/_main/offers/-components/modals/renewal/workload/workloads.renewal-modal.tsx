import { useStore } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import WorkloadItemRenewalModal from "./workload-item.renewal-modal";
import type { OfferPosition } from "@keepit/schemas";
import type { RenewalFormApi } from "../hook/use-renewal-form";

interface Props {
    form: RenewalFormApi;
    customerId: string;
    workloads: Array<OfferPosition>;
}

export default function WorkloadRenewalModal({ form, customerId, workloads }: Props) {
    const { t } = useTranslation();

    const positions = useStore(form.store, (s) => s.values.offerPositions);

    return (
        <div className="grid gap-4 my-4">
            <hr className="text-(--border)" />

            <div className="flex items-center justify-between">
                <p>{t("offerModal.workload_section")}</p>
            </div>

            <div className="grid gap-2">
                {positions.map((_, index) => (
                    <WorkloadItemRenewalModal
                        key={index}
                        form={form}
                        index={index}
                        customerId={customerId}
                        originalPosition={workloads[index]}
                    />
                ))}
            </div>
        </div>
    );
}