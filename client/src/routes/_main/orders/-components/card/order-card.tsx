import { useState } from "react";
import { useTranslation } from "react-i18next";
import OrderCreateModal from "../order-create-modal";
import ConfirmationSection from "./confirmation-section";
import InvoiceSection from "./invoice-section";
import type { Order } from "@keepit/schemas";
import { useCancelOrder, useGenerateOrderDocument  } from "@/hooks/orders/order-mutations";
import { getErrorMessage } from "@/lib/errors";

import { Accordion, Badge, Button } from "@/components";
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

    // Marge nur über die Positionen — die Einkaufsseite kennt keine Pauschalen und Rabatte.
    const positionsSales = orderPositions.reduce((sum, p) => sum + p.total_cents, 0);

    const { generateOrderDocument, isGeneratingDocument } = useGenerateOrderDocument();
    const [openSections, setOpenSections] = useState<Array<string>>([]);

    const handleGenerateDocument = async () => {
        await generateOrderDocument({ orderId: order.id });
        setOpenSections((sections) =>
            sections.includes("documents") ? sections : [...sections, "documents"],
        );
    };

    return (
        <div className="bg-white border border-(--border) rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) relative">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-md">
                            <span className="text-(--text) font-semibold">BE{order.orderId}</span>
                            <span className="text-(--text)">{customer.companyName}</span>
                            {order.cancelledAt && <Badge variant="PENDING" size="xs">{t("orders.cancelled")}</Badge>}
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
                            <p className="text-(--text)">{order.offer.quoteId}</p>
                        </div>

                        <div className="flex items-center gap-1 text-sm font-light">
                            <label className="text-(--text-secondary)">Erstellt:</label>
                            <p className="text-(--text)">{formatDate(order.createdAt)}</p>
                        </div>

                        <div className="flex items-center gap-1 text-sm font-light">
                            <label className="text-(--text-secondary)">Gültig bis:</label>
                            <p className="text-(--text)">
                                {order.validUntil ? formatDate(order.validUntil) : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-6">
                    {/* Einkaufsseite: Bestellung an den Zulieferer. Pauschalen/Rabatte nicht enthalten. */}
                    <div className="flex flex-col items-end">
                        <p
                            className="text-md font-mono font-medium"
                            title={order.supplierPositions.some((p) => p.fallback) ? t("orders.purchase.fallback") : undefined}
                        >
                            {formatEur(order.purchase_net_amount)}
                            {order.supplierPositions.some((p) => p.fallback) && <span className="text-(--text-secondary)"> *</span>}
                        </p>
                        <p className="text-(--text-secondary) font-light text-sm">{t("orders.purchase.purchaseShort")}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-md font-mono font-medium">{formatEur(positionsSales - order.purchase_net_amount)}</p>
                        <p className="text-(--text-secondary) font-light text-sm">{t("orders.purchase.marginShort")}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-md font-mono font-medium">{formatEur(order.net_amount)}</p>
                        <p className="text-(--text-secondary) font-light text-sm">
                            Gesamtpreis
                        </p>
                    </div>
                </div>
            </div>

            <Accordion value={openSections} onValueChange={setOpenSections}>
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
                    {order.discounts.map(discount => <div key={discount.id} className="flex justify-between py-3 text-sm"><span>{discount.title}</span><span>{formatEur(-discount.amount_cents)}</span></div>)}
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
                <Accordion.Section value="documents" label="Dokumente">
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

            <div className="flex items-center justify-between px-2 py-2 border-t border-(--border)">

                {/* Actions left */}
                <div className="flex items-center gap-2">
                    <Button
                        className="min-w-fit"
                        variant="primary"
                        size="xs"
                        loading={isGeneratingDocument}
                        disabled={isGeneratingDocument || Boolean(order.cancelledAt)}
                        onClick={handleGenerateDocument}
                    >
                        Dokument generieren
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button size="xs" variant="border" disabled={Boolean(order.cancelledAt) || isCancellingOrder} onClick={() => setEditing(true)}>{t("orders.edit")}</Button>
                    <Button size="xs" variant="border" danger disabled={Boolean(order.cancelledAt) || isCancellingOrder} loading={isCancellingOrder} onClick={cancel}>{t("orders.cancelOrder")}</Button>
                </div>
            </div>

            {errorCancellingOrder && <p role="alert" className="px-4 py-2 text-sm text-(--destructive)">{getErrorMessage(errorCancellingOrder)}</p>}
            {editing && <OrderCreateModal order={order} onClose={() => setEditing(false)} onCreated={() => setEditing(false)} />}
        </div>
    );
}
