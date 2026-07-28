import { useTranslation } from "react-i18next";
import useRenewalForm from "./hook/use-renewal-form";
import OfferRenewalModal from "./offer/offer.renewal-modal";
import WorkloadRenewalModal from "./workload/workloads.renewal-modal";
import type { Offer } from "@keepit/schemas";
import { Button, ModalDialog, showToast } from "@/components";

interface Props {
    offer: Offer;
    onClose: () => void;
}

export default function RenewalModal({ offer, onClose }: Props) {
    const { t } = useTranslation();
    const { form } = useRenewalForm({ offer, closeFn: onClose });

    const handleSubmit = () => {
        form.handleSubmit();
        showToast.info("offers.toast.renewalStub");
    };

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">{t("renewal.title", { orderId: offer.quoteId })}</h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id="renewal-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="grid gap-4">
                    <OfferRenewalModal form={form} />

                    <WorkloadRenewalModal
                        form={form}
                        customerId={offer.customerId}
                        workloads={offer.offerPositions}
                    />


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