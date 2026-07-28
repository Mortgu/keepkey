import { useTranslation } from "react-i18next";
import type { Offer } from "@keepit/schemas";
import { Button, ModalDialog, showToast } from "@/components";
import WorkloadRenewalModal from "./workload/workloads.renewal-modal";

interface Props {
    offer: Offer;
    onClose: () => void;
}

type FlatRateValue = {
    key: string;
    flatRateId: string;
    quantity: number;
    total_cents: number;
};

const inputDate = (value?: string) => value?.slice(0, 10) ?? "";

const addMonths = (date: string, months: number): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
};

const maxDuration = (durations: Array<number>): number =>
    durations.reduce((a, b) => Math.max(a, b), 0);

export default function RenewalModal({ offer, onClose }: Props) {
    const { t } = useTranslation();

    const handleSubmit = () => {
        showToast.info("offers.toast.renewalStub");
        onClose();
    };

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">{t("renewal.title", { orderId: offer.quoteId })}</h1>
            </ModalDialog.Header>
            <ModalDialog.Content>

                <WorkloadRenewalModal
                    customerId={offer.customerId}
                    workloads={offer.offerPositions}
                />

                {/* Flatrates */}
                <div className="grid gap-4 my-4">
                    <hr className="text-(--border)" />

                    {/* Flatrate Head */}
                    <div className="flex items-center justify-between">
                        <p>{t("offerModal.flatrate_section")}</p>
                    </div>

                    {/* Flatrates */}
                    {offer.offerFlatRates.map(flatrate => (
                        <div></div>
                    ))}

                    {offer.offerFlatRates.length === 0 && (
                        <div className="flex items-center justify-center w-full">
                            <p className="text-gray-400 font-light">Keine Flatrate vorhanden</p>
                        </div>
                    )}
                </div>

            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button variant="border" size="sm" onClick={onClose}>
                    {t("button.cancel")}
                </Button>
                <Button variant="primary" size="sm" onClick={handleSubmit}>
                    {t("button.save")}
                </Button>
            </ModalDialog.Footer>
        </ModalDialog>
    );
}