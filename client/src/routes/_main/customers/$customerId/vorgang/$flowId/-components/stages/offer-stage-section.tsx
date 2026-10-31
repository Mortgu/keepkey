import OfferModal from "@/components/modules/modals/offer/offer-modal";
import type { OfferModalMode } from "@/components/modules/modals/offer/offer-modal-policy";
import {useModal, useGenerateOfferDocument, useFormatters, useLocale, useDeleteOffer} from "@/hooks";
import DocumentCard from "@/routes/_main/-components/card/document-card";
import type { Offer } from "@keepit/schemas";
import {Dot, EllipsisVertical, Plus, RotateCcw, Trash} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FlowStage } from "../../../../-components/flow/flow-types";
import StageShell from "../flow-stage-shell";
import { Accordion, Badge, Button, menuStyles } from "@/components";
import { localized } from "@/lib/i18n-content";
import { Menu } from "@base-ui/react";
import { useState } from "react";

export default function OfferStageSection({ stage, offer }: { stage: FlowStage; offer: Offer }) {
    const { t } = useTranslation();
    const locale = useLocale();

    const offerModal = useModal<{ mode: OfferModalMode }>();
    const { deleteOffer } = useDeleteOffer();

    const { generateOfferDocument, isGenerating } = useGenerateOfferDocument();
    const [openAccordions, setOpenAccordions] = useState<Array<string>>([]);
    const locked = Boolean(offer.acceptedAt);

    const { formatEur, formatDate } = useFormatters();

    const menu = menuStyles();

    const handleGenerateOfferDocument = async () => {
        await generateOfferDocument({ offerId: offer.id });

        setOpenAccordions((sections) => sections.includes("documents") ? sections : [...sections, 'documents']);
    }

    return (
        <StageShell stage={stage}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center justify-start gap-4">
                    <div className="grid gap-0.5">
                        <div className="flex items-center gap-2">
                            <h1 className="font-medium">{t('flows.station.offer.label')}</h1>
                            <Badge variant="GENERATED">{localized(offer.contract.translations, locale, "name")}</Badge>
                        </div>

                        <div className="flex items-center justify-start text-(--fg-3) text-sm">
                            <p className="font-mono">AG{offer.quoteNumber}</p>
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

                                        <Menu.Item className={menu.Item()} onClick={() => deleteOffer({ id: offer.id })} data-danger>
                                            <Trash size={14} /> {t("button.delete")}
                                        </Menu.Item>

                                    </Menu.Popup>
                                </Menu.Positioner>
                            </Menu.Portal>
                        </Menu.Root>
                    </div>
                )}
            </div>

            <Accordion value={openAccordions} onValueChange={setOpenAccordions}>
                <Accordion.Section value="products" label={t("flows.detail.workloads")}>
                    <div className="border-t border-(--border)">
                        <div className="grid items-center grid-cols-[1fr_1fr_1fr_1fr] bg-gray-100 border-b border-(--border) uppercase text-xs font-medium">
                            <p className="px-4 py-1.5 border-r border-(--border)">Produkt</p>
                            <p className="px-4 py-1.5 border-r border-(--border)">Seats</p>
                            <p className="px-4 py-1.5 border-r border-(--border)">Stückpreis</p>
                            <p className="px-4 py-1.5 text-right">total</p>
                        </div>

                        {/* Workload */}
                        {offer.offerPositions.map((position) => (
                            <>
                                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center justify-between border-b border-(--border) last:border-b-0 text-sm">
                                    <p className="px-4 py-3">{localized(position.product.translations, locale, 'name')}</p>
                                    <p className="px-4 py-3">{position.quantity} Stk.</p>
                                    <p className="px-4 py-3">{formatEur(position.eur_user_month)}</p>
                                    <p className="px-4 py-3 text-right">{formatEur(position.total_cents)}</p>
                                </div>

                                {position.free_months > 0 && (
                                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center justify-between border-b border-(--border) last:border-b-0 text-sm">
                                        <p className="px-4 py-3">{localized(position.product.translations, locale, 'name')} - {position.free_months} {t('offerModal.free_months')}</p>
                                        <p className="px-4 py-3">{position.quantity} Stk.</p>
                                        <p className="px-4 py-3">{formatEur(position.eur_user_month)}</p>
                                        <p className="px-4 py-3 text-right">{formatEur(-position.discount_cents)} </p>
                                    </div>
                                )}
                            </>
                        ))}

                        {/* Flatrates */}
                        {offer.offerFlatRates.map((flatrate) => (
                            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center justify-between border-b border-(--border) last:border-b-0 text-sm">
                                <p className="px-4 py-3">{localized(flatrate.flatRate.translations, locale, 'name')}</p>
                                <p className="px-4 py-3">{flatrate.quantity} Stk.</p>
                                <p className="px-4 py-3">-</p>
                                <p className="px-4 py-3 text-right">{formatEur(flatrate.total_cents)}</p>
                            </div>
                        ))}

                        {/* Discounts */}
                        {offer.offerDiscounts.map((discount) => (
                            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center justify-between border-b border-(--border) last:border-b-0 text-sm">
                                <p className="px-4 py-3">{discount.title}</p>
                                <p className="px-4 py-3">-</p>
                                <p className="px-4 py-3">-</p>
                                <p className="px-4 py-3 text-right">{formatEur(-discount.amount_cents)}</p>
                            </div>
                        ))}
                    </div>

                </Accordion.Section>

                <Accordion.Section value="documents" label={t("flows.detail.documents")}>
                    <div className="px-4">
                        {offer.offerDocuments.map((document) => (
                            <DocumentCard key={document.id} type="offer" parentId={offer.id} document={document} locked={locked} />
                        ))}

                        {offer.offerDocuments.length === 0 && (
                            <p className="py-4 text-center text-sm text-(--fg-3)">{t("flows.detail.noDocuments")}</p>
                        )}
                    </div>
                </Accordion.Section>
            </Accordion>

            {offerModal.isOpen && (
                <OfferModal key={offerModal.key} mode={offerModal.data?.mode} sourceOffer={offer} onClose={offerModal.close} />
            )}
        </StageShell>
    );
}