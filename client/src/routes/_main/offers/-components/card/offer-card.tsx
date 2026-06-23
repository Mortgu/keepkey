import { Pen, Trash, UndoDot } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { Button, Collapsable } from "@/components";
import { useDeleteOffer, useGenerateOfferDocument } from "@/hooks/offers/offer-mutations";
import { formatDate } from "@/lib/format";
import type { Offer, OfferDocument } from "@/types";
import { formatEur } from "@/utils/utils";
import OfferDrawerHistory from "../drawer/offer-drawer-history";
import OfferCardDocument from "./offer-card-document";
import OfferCardFlatRate from "./offer-card-flatrate";
import OfferCardProduct from "./offer-card-product";

type OfferListItemProps = {
    offer: Offer;
    onEdit: (offer: Offer) => void;
};

export default function OfferCard({ offer, onEdit }: OfferListItemProps) {
    const {
        customerContactPerson: ccp,
        quoteId,
        offerPositions,
        offerFlatRates,
        customer,
    } = offer;

    const {
        deleteOffer,
        isDeletingOffer,
        errorDeletingOffer
    } = useDeleteOffer();


    const { generateOfferDocument, isGenerating } = useGenerateOfferDocument();

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    const handleDeleteOffer = () => {
        if (confirm("Angebot löschen")) {
            deleteOffer({ id: offer.id });
        }

    };

    useEffect(() => {
        if (errorDeletingOffer) {
            toast.error(`${errorDeletingOffer}`);
        }
    }, [errorDeletingOffer]);

    return (
        <div className="border border-(--border) rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) relative">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-md">
                            <span className="text-(--text) font-semibold">AG{quoteId}</span>
                            <span className="text-(--text)">{customer.companyName}</span>

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
                    <p className="text-md font-semibold">{formatEur(offer.net_amount)}</p>
                    <p className="text-(--text-secondary) font-light text-sm">
                        Gesamtpreis
                    </p>
                </div>
            </div>

            <Collapsable label="Produkte"
                className="w-full bg-(--subtle-50) justify-between rounded-none"
            >
                <div className="grid mx-4">
                    {offerPositions.map((position, i) => (
                        <OfferCardProduct key={i} position={position} />
                    ))}

                    {offerFlatRates.map((flatrate, i) => (
                        <OfferCardFlatRate key={i} flatrate={flatrate} />
                    ))}
                </div>
            </Collapsable>

            <Collapsable
                label="Dokumente"
                className="w-full bg-(--subtle-50) justify-between rounded-none"
            >
                <div className="grid mx-4">
                    {offer.offerDocuments.map((document: OfferDocument) => (
                        <OfferCardDocument key={document.id} offerDocument={document} />
                    ))}
                </div>
            </Collapsable>

            <div className="flex items-center justify-between px-4 py-2 border-t border-(--border)">

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
                </div>

                {/* Actions right */}
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setDrawerOpen(true)}
                        size="xs"
                        variant="secondary"
                        icon={<UndoDot className="size-3" />}
                        iconOnly
                    />

                    <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => onEdit(offer)}
                        icon={<Pen className="size-3" />}
                        iconOnly
                    />

                    <Button
                        size="xs"
                        variant="secondary"
                        onClick={handleDeleteOffer}
                        loading={isDeletingOffer}
                        icon={<Trash className="size-3" />}
                        iconOnly
                    />
                </div>
            </div>

            <OfferDrawerHistory open={drawerOpen} onClose={() => setDrawerOpen(false)} offer={offer} />
        </div>
    );
}
