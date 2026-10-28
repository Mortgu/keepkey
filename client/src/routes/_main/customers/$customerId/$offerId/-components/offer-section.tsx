import { Accordion, Badge, Button } from "@/components";
import DocumentCard from "@/components/modules/document-card";
import OfferModal from "@/components/modules/modals/offer/offer-modal";
import { useFormatters, useGenerateOfferDocument, useLocale, useModal } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { Offer } from "@keepit/schemas";
import { Dot } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
    offer: Offer;
};

export default function OfferSection({ offer }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();

    const { generateOfferDocument, isGenerating } = useGenerateOfferDocument();
    const offerModal = useModal();

    const { formatDate, formatEur } = useFormatters();

    const locked = Boolean(offer.acceptedAt);

    return (
        <div className="border border-(--border) rounded-md data-[accepted=true]" data-accepted={Boolean(offer.acceptedAt)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center justify-start gap-4">
                    <div className="grid gap-0.5">
                        <div className="flex items-center gap-2">
                            <h1 className="font-medium">{t('flows.station.offer.label')}</h1>
                            <Badge variant="GENERATED">{localized(offer.contract.translations, locale, "name")}</Badge>
                        </div>

                        <div className="flex items-center justify-center text-(--fg-3) text-sm">
                            <p className="font-mono">AG{offer.quoteId}</p>
                            <Dot size={14} />
                            <p className="">{formatDate(offer.date)}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {!locked && (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="primary"
                            onClick={() => generateOfferDocument({ offerId: offer.id })}
                        >
                            {t("flows.detail.generateDocument")}
                        </Button>

                        <Button
                            size="sm"
                            variant="border"
                            onClick={() => offerModal.open()}
                        >
                            {t("button.edit")}
                        </Button>
                    </div>
                )}
            </div>

            {/* Products / Workloads */}
            <Accordion defaultValue={['Workloads']}>
                <Accordion.Section value="workloads" label="Workloads">
                    <div className="border-t border-(--border)">
                        <div className="grid items-center grid-cols-[1fr_1fr_1fr_1fr] bg-gray-100 border-b border-(--border) uppercase text-xs font-medium">
                            <p className="px-4 py-1.5 border-r border-(--border)">Produkt</p>
                            <p className="px-4 py-1.5 border-r border-(--border)">Seats</p>
                            <p className="px-4 py-1.5 border-r border-(--border)">Stückpreis</p>
                            <p className="px-4 py-1.5 text-right">total</p>
                        </div>

                        {/* Workload */}
                        {offer.offerPositions.map((position) => (
                            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center justify-between border-b border-(--border) last:border-b-0 text-sm">
                                <p className="px-4 py-3">{localized(position.product.translations, locale, 'name')}</p>
                                <p className="px-4 py-3">{position.quantity} Stk.</p>
                                <p className="px-4 py-3">{formatEur(position.eur_user_month)}</p>
                                <p className="px-4 py-3 text-right">{formatEur(position.total_cents)}</p>
                            </div>
                        ))}
                    </div>
                </Accordion.Section>

                <Accordion.Section value="documents" label="Documents">
                    <div className="border-t border-(--border)">
                        {/* Workload */}
                        {offer.offerDocuments.map((document) => (
                            <DocumentCard
                                key={document.id}
                                type="offer"
                                document={document}
                                parentId={offer.id}
                                locked={locked}
                            />
                        ))}
                    </div>
                </Accordion.Section>
            </Accordion>

            {offerModal.isOpen && (
                <OfferModal key={offerModal.key} sourceOffer={offer} onClose={offerModal.close} />
            )}
        </div>
    )
}
