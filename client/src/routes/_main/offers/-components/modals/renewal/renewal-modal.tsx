import { useTranslation } from "react-i18next";
import useRenewalForm from "./hook/use-renewal-form";
import OfferRenewalModal from "./offer/offer.renewal-modal";
import WorkloadRenewalModal from "./workload/workloads.renewal-modal";
import type { Offer } from "@keepit/schemas";
import { Button, ModalDialog, showToast } from "@/components";
import FlatratesRenewalModal from "./flatrate/flatrates.renewal-modal";
import DiscountRenewalModal from "./discounts/discount.renewal-modal";

interface Props {
    offer: Offer;
    onClose: () => void;
}

export default function RenewalModal({ offer, onClose }: Props) {
    const { t } = useTranslation();
    const { form } = useRenewalForm({ offer, closeFn: onClose });


    const handleSubmit = async () => {
        form.handleSubmit();
        showToast.info("offers.toast.renewalStub");
    };

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">{t("renewal.title", { orderId: offer.quoteId })}</h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id="renewal-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="grid">
                    <div className="flex items-center gap-4 bg-(--page-bg) p-4 rounded-md mb-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <p className="text-xs text-gray-400">Kunde:</p>
                            <p>{offer.customer.companyName}</p>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <p className="text-xs text-gray-400">Ansprechpartner:</p>
                            <p>{offer.customerContactPerson.firstName} {offer.customerContactPerson.lastName}</p>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <p className="text-xs text-gray-400">Mitarbeiter:</p>
                            <p>{offer.user.firstName} {offer.user.lastName}</p>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <p className="text-xs text-gray-400">Ursprüngliche Laufzeit</p>
                            <p>{offer.requestFrom ?? "-"} bis {offer.validUntil ?? "-"}</p>
                        </div>
                    </div>
                    <hr className="text-(--border)" />

                    <OfferRenewalModal form={form} />

                    <WorkloadRenewalModal
                        form={form}
                        customerId={offer.customerId}
                        workloads={offer.offerPositions}
                    />

                    <FlatratesRenewalModal
                        form={form}
                        originalFlatrates={offer.offerFlatRates}
                    />

                    <DiscountRenewalModal form={form} originalDiscounts={offer.offerDiscounts} />
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button variant="border" size="sm" onClick={onClose}>
                    {t("button.cancel")}
                </Button>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button variant="primary" size="sm" type="submit" form="renewal-form" disabled={!canSubmit} loading={isSubmitting}>
                            {t("button.save")}
                        </Button>
                    )} />
            </ModalDialog.Footer>
        </ModalDialog>
    );
}