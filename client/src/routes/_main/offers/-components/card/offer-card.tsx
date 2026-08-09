import { Pen, Trash, UndoDot } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import DerivedModal from "../modals/derived/derived-modal";
import OfferDrawerHistory from "../drawer/offer-drawer-history";
import OfferCardDiscount from "./offer-card-discount";
import OfferCardFlatRate from "./offer-card-flatrate";
import OfferCardProduct from "./offer-card-product";
import type { Offer, OfferDocument } from '@keepit/schemas';
import type { OfferFormTypes } from "../modals/offer/offer-form";
import { Badge, Button, Collapsable } from "@/components";
import { useDeleteOffer, useGenerateOfferDocument } from "@/hooks/offers/offer-mutations";
import { useModal } from "@/hooks";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";
import DocumentCard from "./document-card";

type OfferListItemProps = {
    offer: Offer;
    onEdit: (type: OfferFormTypes, offer: Offer) => void;
};

export default function OfferCard({ offer, onEdit }: OfferListItemProps) {
    const { t } = useTranslation();

    const renewalModal = useModal<Offer>();
    const extensionModal = useModal<Offer>();

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

            <Collapsable label="Produkte"
                className="w-full justify-between rounded-none"
            >
                <div className="grid mx-4">
                    {offerPositions.map((position, i) => (
                        <OfferCardProduct key={i} position={position} />
                    ))}

                    {offerFlatRates.map((flatrate, i) => (
                        <OfferCardFlatRate key={i} flatrate={flatrate} />
                    ))}

                    {offerDiscounts.map((discount) => (
                        <OfferCardDiscount key={discount.id} discount={discount} />
                    ))}
                </div>
            </Collapsable>

            <hr className="text-(--border)" />

            <Collapsable
                label="Dokumente"
                className="w-full justify-between rounded-none"
            >
                <div className="grid mx-4">
                    {offer.offerDocuments.map((document: OfferDocument) => (
                        <DocumentCard key={document.id} document={document} offerId={offer.id} />
                    ))}

                    {offer.offerDocuments.length === 0 && (
                        <div className="flex items-center justify-center py-4">
                            <p className="text-sm text-gray-500">Noch keine Dokumente generiert!</p>
                        </div>
                    )}
                </div>
            </Collapsable>

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

                    <Button variant="border" type="button" size="xs"
                        onClick={() => renewalModal.open(offer)}>{t("derived.action_renewal")}</Button>

                    <Button variant="border" type="button" size="xs"
                        onClick={() => extensionModal.open(offer)}>{t("derived.action_extension")}</Button>
                </div>

                {/* Actions right */}
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setDrawerOpen(true)}
                        size="xs"
                        variant="border"
                        icon={<UndoDot size={13} />}
                        iconOnly
                    />

                    <Button
                        size="xs"
                        variant="border"
                        onClick={() => onEdit("edit", offer)}
                        icon={<Pen size={13} />}
                        iconOnly
                    />

                    <Button
                        size="xs"
                        variant="secondary"
                        danger
                        onClick={handleDeleteOffer}
                        loading={isDeletingOffer}
                        icon={<Trash size={13} />}
                        iconOnly
                    />
                </div>
            </div>

            <OfferDrawerHistory open={drawerOpen} onClose={() => setDrawerOpen(false)} offer={offer} />

            {renewalModal.isOpen && (
                <DerivedModal
                    key={`renewal-${renewalModal.key}`}
                    mode="renewal"
                    offer={offer}
                    onClose={renewalModal.close}
                />
            )}

            {extensionModal.isOpen && (
                <DerivedModal
                    key={`extension-${extensionModal.key}`}
                    mode="extension"
                    offer={offer}
                    onClose={extensionModal.close}
                />
            )}
        </div>
    );
}
