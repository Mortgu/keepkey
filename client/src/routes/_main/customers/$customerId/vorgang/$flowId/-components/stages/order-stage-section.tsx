import { useFormatters, useModal, useGenerateOrderDocument, useCancelOrder, useLocale } from "@/hooks";
import { getErrorMessage } from "@/lib/errors";
import DocumentCard from "@/routes/_main/-components/card/document-card";
import OrderModal from "@/routes/_main/orders/-components/modal/order-modal";
import OrderEditModal from "@/routes/_main/orders/-components/order-edit-modal";
import type { Offer, Order } from "@keepit/schemas";
import { Dot, Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { FlowStage } from "../../../../-components/flow/flow-types";
import StageShell from "../flow-stage-shell";
import { Accordion, Badge, Button, menuStyles } from "@/components";
import { localized } from "@/lib/i18n-content";

interface Props {
    stage: FlowStage;
    offer: Offer;
    order: Order | null;
}

export default function OrderStageSection({ stage, offer, order }: Props) {
    const { t } = useTranslation();
    const locale = useLocale();

    const { formatEur, formatDate } = useFormatters();

    const orderModal = useModal();
    const { generateOrderDocument, isGeneratingDocument } = useGenerateOrderDocument();
    const { cancelOrder, isCancellingOrder, errorCancellingOrder } = useCancelOrder();
    const [openAccordions, setOpenAccordions] = useState<Array<string>>([]);

    if (!order) {
        return (
            <StageShell
                stage={stage}
                headerActions={(
                    <Button size="xs" icon={<Plus />} onClick={() => orderModal.open()}>{t("flows.create.order")}</Button>
                )}
            >
                {orderModal.isOpen && <OrderModal key={orderModal.key} offer={offer} onClose={orderModal.close} />}
            </StageShell>
        );
    }

    const menu = menuStyles();

    const locked = Boolean(order.acceptedAt);
    const cancelled = Boolean(order.cancelledAt);

    const cancel = async () => {
        if (!confirm(t("flows.detail.cancelConfirm", { number: order.orderId }))) return;
        try { await cancelOrder({ orderId: order.id, expectedVersion: order.version }); } catch { /* unten gerendert */ }
    };

    const handleGenerateOrderDocument = async () => {
        await generateOrderDocument({ orderId: order.id });

        setOpenAccordions((sections) => sections.includes("documents") ? sections : [...sections, 'documents']);
    }

    return (
        <StageShell stage={stage}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center justify-start gap-4">
                    <div className="grid gap-0.5">
                        <div className="flex items-center gap-2">
                            <h1 className="font-medium">{t('flows.station.order.label')}</h1>
                            <Badge variant="GENERATED">{localized(order.contract.translations, locale, "name")}</Badge>
                        </div>

                        <div className="flex items-center justify-start text-(--fg-3) text-sm">
                            <p className="font-mono">BE{order.orderId}</p>
                            <Dot size={14} />
                            <p className="">{formatDate(order.createdAt)}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {locked && (
                    <div className="flex items-center gap-2">
                        <Button
                            size="xs"
                            variant="primary"
                            onClick={handleGenerateOrderDocument}
                        >
                            {t("flows.detail.generateDocument")}
                        </Button>

                        <Button
                            size="xs"
                            variant="border"
                            onClick={() => orderModal.open()}
                        >
                            {t("button.edit")}
                        </Button>

                    </div>
                )}
            </div>

            {errorCancellingOrder && (
                <p role="alert" className="px-4 pt-3 text-sm text-(--destructive)">{getErrorMessage(errorCancellingOrder)}</p>
            )}

            <Accordion defaultValue={["documents"]}>
                <Accordion.Section value="products" label={t("flows.detail.products")}>
                    <div className="border-t border-(--border)">
                        <div className="grid items-center grid-cols-[1fr_1fr_1fr_1fr] bg-gray-100 border-b border-(--border) uppercase text-xs font-medium">
                            <p className="px-4 py-1.5 border-r border-(--border)">Produkt</p>
                            <p className="px-4 py-1.5 border-r border-(--border)">Seats</p>
                            <p className="px-4 py-1.5 border-r border-(--border)">Stückpreis</p>
                            <p className="px-4 py-1.5 text-right">total</p>
                        </div>

                        {/* Workload */}
                        {order.orderPositions.map((position) => (
                            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center justify-between border-b border-(--border) last:border-b-0 text-sm">
                                <p className="px-4 py-3">{localized(position.product.translations, locale, 'name')} { }</p>
                                <p className="px-4 py-3">.</p>
                                <p className="px-4 py-3">-</p>
                                <p className="px-4 py-3 text-right">{formatEur(position.total_cents)}</p>
                            </div>
                        ))}

                        {/* Flatrates */}
                        {order.flatRates.map((flatrate) => (
                            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center justify-between border-b border-(--border) last:border-b-0 text-sm">
                                <p className="px-4 py-3">{localized(flatrate.flatRate.translations, locale, 'name')}</p>
                                <p className="px-4 py-3">{flatrate.quantity} Stk.</p>
                                <p className="px-4 py-3">-</p>
                                <p className="px-4 py-3 text-right">{formatEur(flatrate.total_cents)}</p>
                            </div>
                        ))}

                        {/* Discounts */}
                        {order.discounts.map((discount) => (
                            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center justify-between border-b border-(--border) last:border-b-0 text-sm">
                                <p className="px-4 py-3">{discount.title}</p>
                                <p className="px-4 py-3">-</p>
                                <p className="px-4 py-3">-</p>
                                <p className="px-4 py-3 text-right">{formatEur(discount.amount_cents)}</p>
                            </div>
                        ))}
                    </div>
                </Accordion.Section>

                <Accordion.Section value="details" label={t("flows.detail.details")}>
                    <dl className="grid gap-2 py-3 text-sm">
                        <dt>{t("flows.detail.projectNumber")}</dt><dd>{order.projectNumber || "—"}</dd>
                        <dt>{t("flows.detail.projectDescription")}</dt><dd>{order.projectDescription || "—"}</dd>
                        <dt>{t("flows.detail.orderDetails")}</dt><dd>{order.orderDetails || "—"}</dd>
                        <dt>{t("flows.detail.contractStart")}</dt><dd>{order.contractStartDate ? formatDate(order.contractStartDate) : "—"}</dd>
                    </dl>
                </Accordion.Section>

                <Accordion.Section value="documents" label={t("flows.detail.documents")}>
                    <div className="px-4">
                        {order.documents.map((document) => (
                            <DocumentCard key={document.id} type="order" parentId={order.id} document={document} />
                        ))}
                        {order.documents.length === 0 && (
                            <p className="py-4 text-center text-sm text-(--fg-3)">{t("flows.detail.noDocuments")}</p>
                        )}
                    </div>
                </Accordion.Section>
            </Accordion>

            {orderModal.isOpen && (
                <OrderEditModal
                    order={order}
                    onClose={orderModal.close}
                    onCreated={() => { }}
                />
            )}
        </StageShell>
    );
}