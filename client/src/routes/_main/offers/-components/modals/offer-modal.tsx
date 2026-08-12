import { Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

import DiscountSection from "./discount/discounts";
import FlatrateSection from "./flatrate/flatrates";
import HeaderForm from "./header-form";
import WorkloadSection from "./workload/workloads";
import { OfferModalProvider } from "./offer-modal-context";
import { OFFER_MODAL_FORM_ID } from "./offer-modal-policy";
import type { OfferModalMode } from "./offer-modal-policy";
import type { Offer } from '@keepit/schemas';
import { Button, ModalDialog } from "@/components";
import useOfferModalForm from "@/routes/_main/offers/-hooks/use-offer-modal-form";

interface OfferModalProps {
    /** Angebotstyp — bestimmt Bedienbarkeit, Preisquelle und Speichern-Aktion. */
    mode?: OfferModalMode;
    /** Beim Bearbeiten die Vorlage, bei abgeleiteten Angeboten das Quellangebot. */
    sourceOffer?: Offer;
    closeFn: () => void;
    preselectedCustomerId?: string;
}

export default function OfferModal(props: OfferModalProps) {
    const { mode = "offer", sourceOffer, closeFn, preselectedCustomerId } = props;

    const { t } = useTranslation();

    const { form, policy, customerId } = useOfferModalForm({
        mode,
        sourceOffer,
        closeFn,
        preselectedCustomerId,
    });

    const title = () => {
        switch (mode) {
            case "renewal":
                return t("renewal.title", { orderId: sourceOffer?.quoteId });
            case "extension":
                return t("licenseExtension.title", { orderId: sourceOffer?.quoteId });
            default:
                return sourceOffer ? "Angebot bearbeiten" : "Angebot erstellen";
        }
    };

    return (
        <OfferModalProvider value={{ mode, policy, form, sourceOffer, customerId }}>
            <ModalDialog onClose={closeFn}>
                <ModalDialog.Header>
                    <div className="flex items-center justify-between w-full mr-2">
                        <h1 className="text-lg">{title()}</h1>
                    </div>
                </ModalDialog.Header>

                <ModalDialog.Content>
                    <div className="grid gap-4">
                        <HeaderForm />
                        <WorkloadSection />
                        <FlatrateSection />
                        <DiscountSection />
                    </div>
                </ModalDialog.Content>

                <ModalDialog.Footer>
                    <div className="w-full flex items-center justify-end">
                        <div className="flex gap-2">
                            <Button variant="border" size="sm" type="button" onClick={closeFn}>
                                {t("button.cancel")}
                            </Button>

                            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                                <Button form={OFFER_MODAL_FORM_ID} disabled={!canSubmit} type="submit" size="sm">
                                    {isSubmitting && <Loader className="size-4 animate-spin" />}
                                    {t("button.save")}
                                </Button>
                            )} />
                        </div>
                    </div>
                </ModalDialog.Footer>
            </ModalDialog>
        </OfferModalProvider>
    );
}
