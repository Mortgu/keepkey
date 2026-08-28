import { useTranslation } from "react-i18next";

import DiscountSection from "./discount/discounts";
import FlatrateSection from "./flatrate/flatrates";
import HeaderForm from "./header-form";
import WorkloadSection from "./workload/workloads";
import { OfferModalProvider } from "./offer-modal-context";
import { OFFER_MODAL_FORM_ID } from "./offer-modal-policy";
import type { OfferModalMode } from "./offer-modal-policy";
import type { Offer } from '@keepit/schemas';
import { FormDialog } from "@/components";
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
            <FormDialog
                form={form}
                defaultOpen
                onClose={closeFn}
                formId={OFFER_MODAL_FORM_ID}
                title={title()}
            >
                <HeaderForm />
                <WorkloadSection />
                <FlatrateSection />
                <DiscountSection />
            </FormDialog>
        </OfferModalProvider>
    );
}
