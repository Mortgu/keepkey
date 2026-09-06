import { useTranslation } from "react-i18next";

import DiscountSection from "./discount/discounts";
import FlatrateSection from "./flatrate/flatrates";
import HeaderForm from "./header-form";
import WorkloadSection from "./workload/workloads";
import { OfferModalProvider } from "./offer-modal-context";
import { OFFER_MODAL_FORM_ID } from "./offer-modal-policy";
import type { OfferModalMode } from "./offer-modal-policy";
import type { Offer } from '@keepit/schemas';
import { Button, Dialog } from "@/components";
import useOfferModalForm from "@/routes/_main/offers/-hooks/use-offer-modal-form";

interface OfferModalProps {
    /** Angebotstyp — bestimmt Bedienbarkeit, Preisquelle und Speichern-Aktion. */
    mode?: OfferModalMode;
    /** Beim Bearbeiten die Vorlage, bei abgeleiteten Angeboten das Quellangebot. */
    sourceOffer?: Offer;
    onClose: () => void;
    preselectedCustomerId?: string;
}

export default function OfferModal(props: OfferModalProps) {
    const { mode = "offer", sourceOffer, onClose, preselectedCustomerId } = props;

    const { t } = useTranslation();

    const { form, policy, header, pricing } = useOfferModalForm({
        mode,
        sourceOffer,
        onClose,
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
        <OfferModalProvider value={{ mode, policy, form, sourceOffer, header, pricing }}>
            <Dialog
                defaultOpen
                onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
            >
                <Dialog.Header title={title()} />
                <Dialog.Body>
                    <HeaderForm />
                    <hr className="text-(--border)" />
                    <WorkloadSection />
                    <hr className="text-(--border)" />
                    <FlatrateSection />
                    <hr className="text-(--border)" />
                    <DiscountSection />
                </Dialog.Body>
                <Dialog.Footer>
                    <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button
                                type="submit"
                                form={OFFER_MODAL_FORM_ID}
                                size="sm"
                                /* Ohne Preis kein Angebot: eine Position, für
                                   die keine Zelle hinterlegt ist, würde sonst
                                   mit 0,00 € gespeichert. */
                                disabled={!canSubmit || pricing.hasError}
                                title={pricing.hasError
                                    ? "Für mindestens eine Position ist kein Preis hinterlegt."
                                    : undefined}
                                loading={isSubmitting}
                            >
                                {t("button.save")}
                            </Button>
                        )}
                    />
                </Dialog.Footer>
            </Dialog>
        </OfferModalProvider>
    );
}
