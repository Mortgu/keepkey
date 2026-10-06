import { Ban, Pen } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import OrderEditModal from "../order-edit-modal";
import ConfirmationSection from "./confirmation-section";
import InvoiceSection from "./invoice-section";
import type { Order } from "@keepit/schemas";
import { useCancelOrder, useGenerateOrderDocument } from "@/hooks/orders/order-mutations";
import { getErrorMessage } from "@/lib/errors";

import { Accordion, Badge, Button } from "@/components";
import DiscountRow from "@/routes/_main/-components/card/discount-row";
import DocumentCard from "@/routes/_main/-components/card/document-card";
import FlatRateRow from "@/routes/_main/-components/card/flatrate-row";
import PositionRow from "@/routes/_main/-components/card/position-row";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";

interface Props {
    order: Order;
}

export default function OrderCard({ order }: Props) {
    const { t } = useTranslation();
    const [editing, setEditing] = useState(false);
    const { cancelOrder, isCancellingOrder, errorCancellingOrder } = useCancelOrder();
    const cancel = async () => {
        if (!confirm(t("orders.cancelConfirm", { number: order.orderId }))) return;
        try { await cancelOrder({ orderId: order.id, expectedVersion: order.version }); } catch { /* Render mutation error below. */ }
    };
    const { customer, customerContactPerson: ccp, orderPositions, flatRates, documents } = order;
    const cancelled = Boolean(order.cancelledAt);

    // Marge nur über die Positionen — die Einkaufsseite kennt keine Pauschalen und Rabatte.
    const positionsSales = orderPositions.reduce((sum, p) => sum + p.total_cents, 0);
    // Altbestellungen ohne gespeicherte Einkaufspreise: Fallback = Verkaufspreis.
    const hasFallback = order.supplierPositions.some((p) => p.fallback);

    const { generateOrderDocument, isGeneratingDocument } = useGenerateOrderDocument();
    const [openSections, setOpenSections] = useState<Array<string>>([]);

    const handleGenerateDocument = async () => {
        await generateOrderDocument({ orderId: order.id });
        setOpenSections((sections) =>
            sections.includes("documents") ? sections : [...sections, "documents"],
        );
    };

    const dateCell = "flex flex-col gap-0.5 px-4 py-2 text-xs border-l border-(--border) first:border-l-0";

    return (
        <div className="bg-white border border-(--border) rounded-md overflow-hidden">
            {/* Kopf */}
            <div className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="grid gap-0">
                    <div className="flex items-center gap-2">
                        <span className="text-md font-mono font-semibold text-(--text)">BE{order.orderId}</span>
                        {cancelled && <Badge variant="PENDING" size="xs">{t("orders.cancelled")}</Badge>}
                    </div>
                    <p className="text-sm font-light text-(--text-secondary)">
                        {[
                            customer.companyName,
                            `${ccp.firstName} ${ccp.lastName}`.trim(),
                        ].filter(Boolean).join(" · ")}
                    </p>
                </div>

                <div className="flex flex-col items-end">
                    <p className="text-md font-mono font-semibold">{formatEur(order.net_amount)}</p>
                    <p className="text-(--text-secondary) font-light text-sm">Gesamtpreis</p>
                </div>
            </div>

            {/* Status- und Datumsleiste */}
            <div className="grid grid-cols-2 md:grid-cols-5 border-t border-(--border) bg-(--page-bg) text-(--text)">
                <div className={dateCell}>
                    <span className="text-(--text-secondary)">Erstellt am:</span>
                    <span className="text-sm font-medium">{formatDate(order.createdAt)}</span>
                </div>
                <div className={dateCell}>
                    <span className="text-(--text-secondary)">Angebots-Nr.:</span>
                    <span className="text-sm font-medium font-mono">AG{order.offer.quoteId}</span>
                </div>
                <div className={dateCell}>
                    <span className="text-(--text-secondary)">Gültig bis:</span>
                    <span className="text-sm font-medium">{order.validUntil ? formatDate(order.validUntil) : "-"}</span>
                </div>
                {/* Einkaufsseite: Bestellung an den Zulieferer. Pauschalen/Rabatte nicht enthalten. */}
                <div className={dateCell} title={hasFallback ? t("orders.purchase.fallback") : undefined}>
                    <span className="text-(--text-secondary)">{t("orders.purchase.purchaseShort")}</span>
                    <span className="text-sm font-medium font-mono">
                        {formatEur(order.purchase_net_amount)}
                        {hasFallback && <span className="text-(--text-secondary)"> *</span>}
                    </span>
                </div>
                <div className={dateCell}>
                    <span className="text-(--text-secondary)">{t("orders.purchase.marginShort")}</span>
                    <span className="text-sm font-medium font-mono">{formatEur(positionsSales - order.purchase_net_amount)}</span>
                </div>
            </div>

            <Accordion value={openSections} onValueChange={setOpenSections} className="border-t border-(--border)">
                <Accordion.Section value="products" label="Produkte">
                    {orderPositions.map((position) => (
                        <PositionRow
                            key={position.id}
                            position={position}
                            contract={order.contract}
                            durationMonths={order.duration_months}
                        />
                    ))}

                    {flatRates.map((flatrate) => (
                        <FlatRateRow key={flatrate.id} flatrate={flatrate} />
                    ))}

                    {order.discounts.map((discount) => (
                        <DiscountRow key={discount.id} discount={discount} />
                    ))}
                </Accordion.Section>

                <Accordion.Section value="details" label={t("orders.details")}>
                    <dl className="grid gap-2 py-3 text-sm">
                        <dt>{t("orders.projectNumber")}</dt><dd>{order.projectNumber || "—"}</dd>
                        <dt>{t("orders.projectDescription")}</dt><dd>{order.projectDescription || "—"}</dd>
                        <dt>{t("orders.details")}</dt><dd>{order.orderDetails || "—"}</dd>
                        <dt>{t("orders.contractStartDate")}</dt><dd>{order.contractStartDate ? formatDate(order.contractStartDate) : "—"}</dd>
                    </dl>
                </Accordion.Section>
                <Accordion.Section value="confirmation" label={t("orders.confirmation.title")}>
                    <ConfirmationSection order={order} />
                </Accordion.Section>
                <Accordion.Section value="invoice" label={t("orders.invoice.title")}>
                    <InvoiceSection order={order} />
                </Accordion.Section>
                <Accordion.Section
                    value="documents"
                    label="Dokumente"
                    aside={(
                        <Button
                            className="min-w-fit h-auto rounded-none border-l border-(--border) px-4"
                            variant="secondary"
                            size="xs"
                            loading={isGeneratingDocument}
                            disabled={isGeneratingDocument || cancelled}
                            onClick={handleGenerateDocument}
                        >
                            Dokument generieren
                        </Button>
                    )}
                >
                    {documents.map((document) => (
                        <DocumentCard
                            key={document.id}
                            type="order"
                            parentId={order.id}
                            document={document}
                        />
                    ))}

                    {documents.length === 0 && (
                        <div className="flex items-center justify-center py-4">
                            <p className="text-sm text-(--text-secondary)">Noch keine Dokumente generiert!</p>
                        </div>
                    )}
                </Accordion.Section>
            </Accordion>

            {/* Aktionen */}
            <div className="flex items-center justify-between gap-2 p-2 border-t border-(--border)">
                <div className="flex items-center gap-2">
                    {errorCancellingOrder && (
                        <p role="alert" className="px-2 text-sm text-(--destructive)">{getErrorMessage(errorCancellingOrder)}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="xs"
                        variant="border"
                        disabled={cancelled || isCancellingOrder}
                        title={cancelled ? t("orders.cancelled") : t("orders.edit")}
                        onClick={() => setEditing(true)}
                        icon={<Pen className="size-3" />}
                        iconOnly
                    />

                    <Button
                        size="xs"
                        variant="secondary"
                        danger
                        disabled={cancelled || isCancellingOrder}
                        title={cancelled ? t("orders.cancelled") : t("orders.cancelOrder")}
                        onClick={cancel}
                        loading={isCancellingOrder}
                        icon={<Ban className="size-3" />}
                        iconOnly
                    />
                </div>
            </div>

            {editing && <OrderEditModal order={order} onClose={() => setEditing(false)} onCreated={() => setEditing(false)} />}
        </div>
    );
}
