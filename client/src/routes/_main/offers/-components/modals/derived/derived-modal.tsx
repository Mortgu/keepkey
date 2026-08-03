import { useTranslation } from "react-i18next";
import useDerivedForm from "./hook/use-derived-form";
import OfferDerivedModal from "./offer/offer.derived-modal";
import WorkloadDerivedModal from "./workload/workloads.derived-modal";
import FlatratesDerivedModal from "./flatrate/flatrates.derived-modal";
import DiscountDerivedModal from "./discounts/discount.derived-modal";
import type { DerivedMode } from "./hook/use-derived-form";
import type { Offer } from "@keepit/schemas";
import { Button, ModalDialog } from "@/components";

interface Props {
    offer: Offer;
    mode: DerivedMode;
    onClose: () => void;
}

export default function DerivedModal({ offer, mode, onClose }: Props) {
    const { t } = useTranslation();
    const { form } = useDerivedForm({ offer, mode, closeFn: onClose });

    const isExtension = mode === "extension";
    const formId = isExtension ? "extension-form" : "renewal-form";

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        await form.handleSubmit();
    };

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">
                    {isExtension
                        ? t("licenseExtension.title", { orderId: offer.quoteId })
                        : t("renewal.title", { orderId: offer.quoteId })}
                </h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id={formId} onSubmit={handleSubmit} className="grid">
                    <div className="flex items-center gap-4 bg-(--page-bg) p-4 rounded-md mb-4">
                        <div className="flex-1 flex flex-col gap-1">
                            <p className="text-xs text-gray-400">{t("derived.customer")}</p>
                            <p>{offer.customer.companyName}</p>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <p className="text-xs text-gray-400">{t("derived.contact")}</p>
                            <p>{offer.customerContactPerson.firstName} {offer.customerContactPerson.lastName}</p>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <p className="text-xs text-gray-400">{t("derived.employee")}</p>
                            <p>{offer.user.firstName} {offer.user.lastName}</p>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                            <p className="text-xs text-gray-400">{t("derived.original_period")}</p>
                            <p>{offer.requestFrom ?? "-"} bis {offer.validUntil ?? "-"}</p>
                        </div>
                    </div>

                    {isExtension && (
                        <p className="text-sm text-gray-500 mb-4">{t("licenseExtension.hint")}</p>
                    )}

                    <hr className="text-(--border)" />

                    <OfferDerivedModal form={form} />

                    <WorkloadDerivedModal
                        form={form}
                        mode={mode}
                        offerId={offer.id}
                        customerId={offer.customerId}
                        workloads={offer.offerPositions}
                    />

                    {/* Eine Erweiterung bestellt nur Seats nach — vertragsweite
                        Pauschalen und die Rabatte des Ursprungsangebots wären
                        hier eine Doppelberechnung. */}
                    {!isExtension && (
                        <>
                            <FlatratesDerivedModal
                                form={form}
                                originalFlatrates={offer.offerFlatRates}
                            />

                            <DiscountDerivedModal form={form} originalDiscounts={offer.offerDiscounts} />
                        </>
                    )}
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button variant="border" size="sm" onClick={onClose}>
                    {t("button.cancel")}
                </Button>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button variant="primary" size="sm" type="submit" form={formId} disabled={!canSubmit} loading={isSubmitting}>
                            {t("button.save")}
                        </Button>
                    )} />
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
