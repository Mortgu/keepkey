import { useTranslation } from "react-i18next";
import useOrderModal from "../../-hooks/use-order-modal";
import OrderModalDetail from "./order-modal.detail";
import OrderModalOfferList from "./order-modal.offer-list";
import type { Offer } from "@keepit/schemas";
import { Button, Dialog } from "@/components";

interface Props {
    /**
     * Von der Angebotskarte aus: das Angebot steht fest, die Liste entfällt.
     * Ohne `offer` (Bestellseite) wird links gesucht und gewählt.
     */
    offer?: Offer;
    onClose: () => void;
}

const FORM_ID = "order-modal-form";

/**
 * „Bestellung anlegen“ — links die offenen Angebote, rechts das gewählte
 * Angebot mit Einkaufspreisen und Bestelldaten. Beide Spalten scrollen
 * getrennt, deshalb ein eigenes Grid statt `Dialog.Body`.
 */
export default function OrderModal({ offer: initialOffer, onClose }: Props) {
    const { t } = useTranslation();
    const modal = useOrderModal({ initialOffer, onCreated: onClose });
    const { offer } = modal;
    const withList = initialOffer === undefined;

    return (
        <Dialog defaultOpen size="xl" className="h-[min(52rem,calc(100vh_-_2rem))]" onOpenChange={(open) => { if (!open) onClose(); }}>
            <Dialog.Header
                title={t("orders.modal.title")}
                description={offer
                    ? t("orders.modal.fromOffer", { quoteId: offer.quoteId, company: offer.customer.companyName })
                    : t("orders.modal.pickHint")}
            />

            <div className={["flex-auto min-h-0 grid", withList ? "grid-cols-[minmax(20rem,5fr)_minmax(0,7fr)]" : "grid-cols-1"].join(" ")}>
                {withList && <OrderModalOfferList selectedId={offer?.id} onSelect={modal.select} />}

                {offer ? (
                    <OrderModalDetail offer={offer} form={modal.form} rows={modal.rows} error={modal.error} formId={FORM_ID} />
                ) : (
                    <div className="h-full bg-(--page-bg) p-6 flex items-center justify-center">
                        <div className="max-w-sm text-center grid gap-2 border border-dashed border-(--border) rounded-md p-8">
                            <p className="font-medium">{t("orders.modal.emptyTitle")}</p>
                            <p className="text-sm text-(--text-secondary)">{t("orders.modal.emptyHint")}</p>
                        </div>
                    </div>
                )}
            </div>

            <Dialog.Footer className="justify-between">
                <p className="text-sm text-(--text-secondary) self-center">
                    {offer ? `AG${offer.quoteId} → BE…` : t("orders.modal.noneSelected")}
                </p>
                <div className="flex items-center gap-3">
                    <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
                    <modal.form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button
                                type="submit"
                                form={FORM_ID}
                                size="sm"
                                disabled={!offer || !canSubmit || isSubmitting}
                                loading={isSubmitting}
                            >
                                {t("orders.modal.submit")}
                            </Button>
                        )}
                    />
                </div>
            </Dialog.Footer>
        </Dialog>
    );
}
