import { Pen, Trash, UndoDot } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import OfferDrawerHistory from "../drawer/offer-drawer-history";
import OfferModal from "../modals/offer-modal";
import type { OfferModalMode } from "../modals/offer-modal-policy";
import type { Offer, OfferDocument } from '@keepit/schemas';
import { Accordion, Badge, Button } from "@/components";
import DiscountRow from "@/routes/_main/-components/card/discount-row";
import DocumentCard from "@/routes/_main/-components/card/document-card";
import FlatRateRow from "@/routes/_main/-components/card/flatrate-row";
import PositionRow from "@/routes/_main/-components/card/position-row";
import { useDeleteOffer, useGenerateOfferDocument } from "@/hooks/offers/offer-mutations";
import { useModal } from "@/hooks";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";

type OfferListItemProps = {
    offer: Offer;
};

export default function OfferCard({ offer }: OfferListItemProps) {
    const { t } = useTranslation();

    /** `data` trägt nur die Variante — die Quelle ist immer das Angebot dieser Karte. */
    const offerModal = useModal<{ mode: OfferModalMode }>();

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

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    const handleDeleteOffer = () => {
        if (confirm("Angebot löschen")) {
            deleteOffer({ id: offer.id });
        }
    };

    return (
        <div className="bg-white border border-(--border) rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) relative">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-md">
                            <span className="text-(--text) font-semibold">AG{quoteId}</span>
                            <span className="text-(--text)">{customer.companyName}</span>
                            {offer.derivationType === "RENEWAL" && (
                                <Badge variant="GENERATED" size="xs">{t("derived.badge_renewal")}</Badge>
                            )}
                            {offer.derivationType === "LICENSE_EXTENSION" && (
                                <Badge variant="GENERATED" size="xs">{t("derived.badge_extension")}</Badge>
                            )}
                        </div>
                    </div>


                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1 text-sm font-light">
                            <label className="text-(--text-secondary)">Kontakt:</label>
                            <p className="text-(--text)">
                                {ccp.salutation} {ccp.firstName} {ccp.lastName}
                            </p>
                        </div>

                        <div className="flex items-center gap-1 text-sm font-light">
                            <label className="text-(--text-secondary)">Angebots-Nr.</label>
                            <p className="text-(--text)">{quoteId}</p>
                        </div>

                        <div className="flex items-center gap-1 text-sm font-light">
                            <label className="text-(--text-secondary)">Erstellt:</label>
                            <p className="text-(--text)">{formatDate(offer.createdAt)}</p>
                        </div>

                        <div className="flex items-center gap-1 text-sm font-light">
                            <label className="text-(--text-secondary)">Gültig bis:</label>
                            <p className="text-(--text)">
                                {offer.validUntil ? formatDate(offer.validUntil) : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <p className="text-md font-mono font-medium">{formatEur(offer.net_amount)}</p>
                    <p className="text-(--text-secondary) font-light text-sm">
                        Gesamtpreis
                    </p>
                </div>
            </div>

            <Accordion>
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

                <Accordion.Section value="documents" label="Dokumente">
                    {offer.offerDocuments.map((document: OfferDocument) => (
                        <DocumentCard
                            key={document.id}
                            type="offer"
                            parentId={offer.id}
                            document={document}
                        />
                    ))}

                    {offer.offerDocuments.length === 0 && (
                        <div className="flex items-center justify-center py-4">
                            <p className="text-sm text-(--text-secondary)">Noch keine Dokumente generiert!</p>
                        </div>
                    )}
                </Accordion.Section>
            </Accordion>

            <div className="flex items-center justify-between px-2 py-2 border-t border-(--border)">

                {/* Actions left */}
                <div className="flex items-center gap-2">
                    <Button
                        className="min-w-fit"
                        variant="primary"
                        size="xs"
                        loading={isGenerating}
                        disabled={isGenerating}
                        onClick={() => generateOfferDocument({ offerId: offer.id })}
                    >
                        Dokument generieren
                    </Button>

                    <Button
                        variant="border"
                        type="button"
                        size="xs"
                        onClick={() => offerModal.open({ mode: "renewal" })}>
                        {t("derived.action_renewal")}
                    </Button>

                    <Button
                        variant="border"
                        type="button"
                        size="xs"
                        onClick={() => offerModal.open({ mode: "extension" })}>
                        {t("derived.action_extension")}
                    </Button>

                </div>

                {/* Actions right */}
                <div className="flex items-center gap-2">
                    <Button
                        size="xs"
                        variant="border"
                        title={t("versionHistory.title")}
                        onClick={() => setDrawerOpen(true)}
                        icon={<UndoDot className="size-3" />}
                        iconOnly
                    />

                    <Button
                        size="xs"
                        variant="border"
                        onClick={() => offerModal.open()}
                        icon={<Pen className="size-3" />}
                        iconOnly
                    />

                    <Button
                        size="xs"
                        variant="secondary"
                        danger
                        onClick={handleDeleteOffer}
                        loading={isDeletingOffer}
                        icon={<Trash className="size-3" />}
                        iconOnly
                    />
                </div>
            </div>

            <OfferDrawerHistory open={drawerOpen} onClose={() => setDrawerOpen(false)} offer={offer} />

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
