import { ChevronRight, Pen, Trash } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Accordion, Badge, Button } from "@/components";
import { useModal } from "@/hooks";
import { useDeleteOffer, useGenerateOfferDocument } from "@/hooks/offers/offer-mutations";
import { formatDate } from "@/lib/format";
import DiscountRow from "@/routes/_main/-components/card/discount-row";
import DocumentCard from "@/routes/_main/-components/card/document-card";
import FlatRateRow from "@/routes/_main/-components/card/flatrate-row";
import PositionRow from "@/routes/_main/-components/card/position-row";
import OrderModal from "@/routes/_main/orders/-components/modal/order-modal";
import { formatEur } from "@/utils/utils";
import type { Offer, OfferDocument } from '@keepit/schemas';
import OfferModal from "../../../../../components/modules/modals/offer/offer-modal";
import type { OfferModalMode } from "../../../../../components/modules/modals/offer/offer-modal-policy";

type OfferListItemProps = {
    offer: Offer;
};

export default function OfferCard({ offer }: OfferListItemProps) {
    const { t } = useTranslation();

    /** `data` trägt nur die Variante — die Quelle ist immer das Angebot dieser Karte. */
    const offerModal = useModal<{ mode: OfferModalMode }>();
    const orderModal = useModal();

    const {
        customerContactPerson: ccp,
        quoteId,
        offerPositions,
        offerFlatRates,
        customer,
        offerDiscounts,
    } = offer;

    const {
        deleteOffer,
        isDeletingOffer,
    } = useDeleteOffer();


    const { generateOfferDocument, isGenerating } = useGenerateOfferDocument();

    const [openSections, setOpenSections] = useState<Array<string>>([]);

    const handleGenerateDocument = async () => {
        await generateOfferDocument({ offerId: offer.id });
        setOpenSections((sections) =>
            sections.includes("documents") ? sections : [...sections, "documents"],
        );
    };

    const handleDeleteOffer = () => {
        if (!offer.acceptedAt && confirm("Angebot löschen")) {
            deleteOffer({ id: offer.id });
        }
    };

    const dateCell = "flex flex-col gap-0.5 px-4 py-2 text-xs border-l border-(--border) first:border-l-0";

    return (
        <div className="bg-white border border-(--border) rounded-md overflow-hidden">
            {/* Kopf */}
            <div className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="grid gap-0">
                    <div className="flex items-center gap-2">
                        <a className="text-md font-mono font-semibold text-(--text)">AG{quoteId}</a>
                        {offer.derivationType === "RENEWAL" && (
                            <Badge variant="GENERATED" size="xs">{t("derived.badge_renewal")}</Badge>
                        )}
                        {offer.derivationType === "LICENSE_EXTENSION" && (
                            <Badge variant="GENERATED" size="xs">{t("derived.badge_extension")}</Badge>
                        )}
                    </div>
                    <p className="text-sm font-light text-(--text-secondary)">
                        {[
                            customer.companyName,
                            `${ccp.firstName} ${ccp.lastName}`,
                            `${customer.zip} ${customer.city}`.trim(),
                        ].filter(Boolean).join(" · ")}
                    </p>
                </div>

                <div className="flex flex-col items-end">
                    <p className="text-md font-mono font-semibold">{formatEur(offer.net_amount)}</p>
                    <p className="text-(--text-secondary) font-light text-sm">Gesamtpreis</p>
                </div>
            </div>

            {/* Status- und Datumsleiste */}
            <div className="grid grid-cols-2 md:grid-cols-4 border-t border-(--border) bg-(--page-bg) text-(--text)">
                {offer.acceptedAt && (
                    <div className={`${dateCell} flex-row items-center justify-between bg-(--primary-50) text-(--primary)`}>
                        <div className="grid gap-0.5">
                            <span className="text-xs">{t("orders.accepted")} am:</span>
                            <span className="text-sm font-medium">{formatDate(offer.acceptedAt)}</span>
                        </div>
                        <ChevronRight className="size-4" />
                    </div>
                )}
                <div className={dateCell}>
                    <span className="text-(--text-secondary)">Erstellt am:</span>
                    <span className="text-sm font-medium">{formatDate(offer.createdAt)}</span>
                </div>
                <div className={dateCell}>
                    <span className="text-(--text-secondary)">Gültig vom:</span>
                    <span className="text-sm font-medium">{offer.validFrom ? formatDate(offer.validFrom) : "-"}</span>
                </div>
                <div className={dateCell}>
                    <span className="text-(--text-secondary)">Gültig bis:</span>
                    <span className="text-sm font-medium">{offer.validUntil ? formatDate(offer.validUntil) : "-"}</span>
                </div>
            </div>

            <Accordion value={openSections} onValueChange={setOpenSections} className="border-t border-(--border)">
                <Accordion.Section value="products" label="Produkte">
                    {offerPositions.map((position) => (
                        <PositionRow
                            key={position.id}
                            position={position}
                            contract={offer.contract}
                            durationMonths={offer.duration_months}
                        />
                    ))}

                    {offerFlatRates.map((flatrate) => (
                        <FlatRateRow key={flatrate.id} flatrate={flatrate} />
                    ))}

                    {offerDiscounts.map((discount) => (
                        <DiscountRow key={discount.id} discount={discount} />
                    ))}
                </Accordion.Section>

                <Accordion.Section
                    value="documents"
                    label="Dokumente"
                    aside={(
                        <Button
                            className="min-w-fit h-auto rounded-none border-l border-(--border) px-4"
                            variant="secondary"
                            size="xs"
                            loading={isGenerating}
                            disabled={isGenerating || Boolean(offer.acceptedAt)}
                            title={offer.acceptedAt ? t("orders.acceptedHint") : undefined}
                            onClick={handleGenerateDocument}
                        >
                            Dokument generieren
                        </Button>
                    )}
                >
                    {offer.offerDocuments.map((document: OfferDocument) => (
                        <DocumentCard
                            key={document.id}
                            type="offer"
                            parentId={offer.id}
                            document={document}
                            locked={Boolean(offer.acceptedAt)}
                        />
                    ))}

                    {offer.offerDocuments.length === 0 && (
                        <div className="flex items-center justify-center py-4">
                            <p className="text-sm text-(--text-secondary)">Noch keine Dokumente generiert!</p>
                        </div>
                    )}
                </Accordion.Section>
            </Accordion>

            {/* Aktionen */}
            <div className="flex items-center justify-between gap-2 p-2 border-t border-(--border)">
                <div className="flex items-center gap-2">
                    <Button
                        variant="primary"
                        type="button"
                        size="xs"
                        disabled={Boolean(offer.acceptedAt)}
                        title={offer.acceptedAt ? t("orders.acceptedHint") : undefined}
                        onClick={() => orderModal.open()}>
                        Bestellung erstellen
                    </Button>

                    <Button
                        variant="secondary"
                        type="button"
                        size="xs"
                        onClick={() => offerModal.open({ mode: "renewal" })}>
                        {t("derived.action_renewal")}
                    </Button>

                    <Button
                        variant="secondary"
                        type="button"
                        size="xs"
                        onClick={() => offerModal.open({ mode: "extension" })}>
                        {t("derived.action_extension")}
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="xs"
                        variant="border"
                        disabled={Boolean(offer.acceptedAt)}
                        title={offer.acceptedAt ? t("orders.acceptedHint") : t("orders.edit")}
                        onClick={() => offerModal.open()}
                        icon={<Pen className="size-3" />}
                        iconOnly
                    />

                    <Button
                        size="xs"
                        variant="secondary"
                        danger
                        disabled={Boolean(offer.acceptedAt)}
                        title={offer.acceptedAt ? t("orders.acceptedHint") : undefined}
                        onClick={handleDeleteOffer}
                        loading={isDeletingOffer}
                        icon={<Trash className="size-3" />}
                        iconOnly
                    />
                </div>
            </div>

            {orderModal.isOpen && (
                <OrderModal
                    key={orderModal.key}
                    offer={offer}
                    onClose={orderModal.close}
                />
            )}

            {offerModal.isOpen && (
                <OfferModal
                    key={offerModal.key}
                    mode={offerModal.data?.mode}
                    sourceOffer={offer}
                    onClose={offerModal.close}
                />
            )}
        </div>
    );
}
