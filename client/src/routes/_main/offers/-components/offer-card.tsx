import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Pen, Trash, UndoDot } from "lucide-react";
import { Document, LineItemRow } from "./card-components";
import OfferRevisionHistory from "./card-components/offer-revision-history";
import type { Offer, OfferDocument } from "@/types";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";
import { useLocale, useOfferHook } from "@/hooks";
import { Badge, Button, Collapsable, Drawer } from "@/components";
import { localized } from "@/lib/i18n-content";

type OfferListItemProps = {
    offer: Offer;
    onEdit: (offer: Offer) => void;
};

function OfferPositionRow({ op }: { op: Offer["offerPositions"][number] }) {
    const locale = useLocale();
    return (
        <LineItemRow
            left={
                <div className="grid">
                    <div className="flex gap-2">
                        <p className="text-sm">
                            {localized(op.product.translations, locale, "name")}
                        </p>
                        <Badge variant="draft">
                            {localized(op.contract.translations, locale, "name")}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 text-sm font-light">
                            <span className="text-(--text-secondary)">Seats:</span>
                            <p>{op.quantity}</p>
                        </div>
                        <div className="flex gap-1 text-sm font-light">
                            <span className="text-(--text-secondary)">Laufzeit:</span>
                            <p>{op.duration_months} Monate</p>
                        </div>
                    </div>
                </div>
            }
            right={
                <>
                    <p className="text-sm font-semibold">{formatEur(op.total_cents)}</p>
                    <p className="text-(--text-secondary) font-light text-sm">
                        Gesamtpreis (netto)
                    </p>
                </>
            }
        />
    );
}

function OfferFlatRateRow({ fr }: { fr: Offer["offerFlatRates"][number] }) {
    const locale = useLocale();
    return (
        <LineItemRow
            left={
                <div className="grid">
                    <p className="text-sm">
                        {localized(fr.flatRate.translations, locale, "name")}
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 text-sm font-light">
                            <span className="text-(--text-secondary)">Anzahl:</span>
                            <p>{fr.quantity}</p>
                        </div>
                    </div>
                </div>
            }
            right={
                <>
                    <p className="text-sm font-semibold">{formatEur(fr.total_cents)}</p>
                    <p className="text-(--text-secondary) font-light text-sm">
                        Gesamtpreis (netto)
                    </p>
                </>
            }
        />
    );
}

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
        errorDeletingOffer,

        generateDocument,
        isGeneratingDocument,
    } = useOfferHook();

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
                            <span className="text-(--text)">{customer.companyName}</span>
                            <span>-</span>
                            <span>{quoteId}</span>
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

            <Collapsable
                label="Produkte"
                className="w-full bg-(--subtle-50) justify-between rounded-none"
            >
                <div className="grid gap-2 px-4 py-3">
                    {offerPositions.map((op, i) => (
                        <OfferPositionRow key={i} op={op} />
                    ))}
                    {offerFlatRates.map((fr, i) => (
                        <OfferFlatRateRow key={i} fr={fr} />
                    ))}
                    <LineItemRow
                        left={
                            <span className="text-sm text-(--text-secondary) font-light">
                                Gesamtpreis
                            </span>
                        }
                        right={<p>{formatEur(offer.net_amount)}</p>}
                    />
                </div>
            </Collapsable>

            <Collapsable
                label="Dokumente"
                className="w-full bg-(--subtle-50) justify-between rounded-none"
            >
                <div className="grid gap-2 px-4 py-3">
                    {offer.offerDocuments.map((document: OfferDocument) => (
                        <Document
                            key={document.id}
                            offer={offer}
                            document={document.document}
                        />
                    ))}

                    <Button
                        className="min-w-fit"
                        variant="primary"
                        size="sm"
                        loading={isGeneratingDocument}
                        disabled={isGeneratingDocument}
                        onClick={() => generateDocument({ offerId: offer.id })}
                    >
                        Dokument generieren
                    </Button>
                </div>
            </Collapsable>

            <div className="flex items-center justify-between px-2 py-2 border-t border-(--border)">
                <div className="flex items-center gap-2"></div>
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
                        icon={<Trash className="size-3" />}
                        iconOnly
                    />
                </div>
            </div>

            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} wide>
                <Drawer.Header title="History" subtitle="Vergangene Preistabellen" />
                <Drawer.Body>
                    <OfferRevisionHistory offerId={offer.id} />
                </Drawer.Body>
            </Drawer>
        </div>
    );
}
