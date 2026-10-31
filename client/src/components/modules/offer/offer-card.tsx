import { Accordion, Badge, Button, menuStyles } from "@/components";
import OfferModal from "@/components/modules/modals/offer/offer-modal";
import { useFormatters, useGenerateOfferDocument, useLocale, useModal, useOffer } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import DocumentCard from "@/routes/_main/-components/card/document-card";
import { Menu } from "@base-ui/react";
import { Dot, EllipsisVertical, LoaderCircle, Plus, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { OfferModalMode } from "../modals/offer/offer-modal-policy";
import { useState } from "react";

type Props = {
    offerId: string
};

export default function OfferCard({ offerId }: Props) {
    const { offer, isPending, error } = useOffer(offerId);

    if (isPending) {
        return <LoaderCircle className="size-4 animate-spin" />
    }

    if (error) {
        return (
            <div>{error.message}</div>
        )
    }

    if (!offer) {
        return null;
    }

    const { t } = useTranslation();
    const locale = useLocale();

    const { generateOfferDocument, isGenerating } = useGenerateOfferDocument();
    const offerModal = useModal<{ mode: OfferModalMode }>();

    const [openAccordionSection, setOpenAccordionSection] = useState<Array<string>>([]);

    const { formatDate, formatEur } = useFormatters();
    const menu = menuStyles();

    const locked = Boolean(offer.acceptedAt);

    const handleGenerateOfferDocument = async () => {
        await generateOfferDocument({ offerId: offer.id });

        setOpenAccordionSection((sections) => sections.includes("documents") ? sections : [...sections, 'documents']);
    }

    return (
        <div className="border border-(--border) rounded-md data-[accepted=true]" data-accepted={locked}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center justify-start gap-4">
                    <div className="grid gap-0.5">
                        <div className="flex items-center gap-2">
                            <h1 className="font-medium">{t('flows.station.offer.label')}</h1>
                            <Badge variant="GENERATED">{localized(offer.contract.translations, locale, "name")}</Badge>
                        </div>

                        <div className="flex items-center justify-start text-(--fg-3) text-sm">
                            <p className="font-mono">AG{offer.quoteId}</p>
                            <Dot size={14} />
                            <p className="">{formatDate(offer.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {!locked && (
                    <div className="flex items-center gap-2">
                        <Button
                            size="xs"
                            variant="primary"
                            onClick={handleGenerateOfferDocument}
                        >
                            {t("flows.detail.generateDocument")}
                        </Button>

                        <Button
                            size="xs"
                            variant="border"
                            onClick={() => offerModal.open()}
                        >
                            {t("button.edit")}
                        </Button>

                        <Menu.Root>
                            <Menu.Trigger className={menu.Trigger()} render={
                                <Button size="xs" variant="border" icon={<EllipsisVertical size={14} />} iconOnly />
                            } />
                            <Menu.Portal>
                                <Menu.Positioner className={menu.Positioner()} align="end">
                                    <Menu.Popup className={menu.Popup()}>

                                        <Menu.Item className={menu.Item()} onClick={() => offerModal.open({ mode: "renewal" })}>
                                            <RotateCcw size={14} /> {t("derived.action_renewal")}
                                        </Menu.Item>

                                        <Menu.Item className={menu.Item()} onClick={() => offerModal.open({ mode: "extension" })}>
                                            <Plus size={14} /> {t("derived.action_extension")}
                                        </Menu.Item>

                                    </Menu.Popup>
                                </Menu.Positioner>
                            </Menu.Portal>
                        </Menu.Root>
                    </div>
                )}
            </div>

            {/* Products / Workloads */}
            <Accordion value={openAccordionSection} onValueChange={setOpenAccordionSection}>
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

                <Accordion.Section value="documents" label={t("flows.detail.documents")}>
                    <div className="px-4 border-t border-(--border)">
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

                        {offer.offerDocuments.length === 0 && (
                            <div className="flex items-center justify-center py-4">
                                <p className="text-sm text-(--text-secondary)">{t('offers.documents.not_generated')}</p>
                            </div>
                        )}
                    </div>
                </Accordion.Section>
            </Accordion>

            {offerModal.isOpen && (
                <OfferModal
                    key={offerModal.key}
                    mode={offerModal.data?.mode}
                    sourceOffer={offer}
                    onClose={offerModal.close}
                />
            )}
        </div>
    )
}

