import React, {useEffect, useState} from "react";
import {toast} from "react-toastify";
import {Download, File, Loader, Trash} from "lucide-react";
import {LineItemRow} from "../../offers/-components/card-components";
import type {Order, OrderDocument, OrderPosition, OrderFlatRate} from "@/types";
import {formatDate} from "@/lib/format";
import {formatEur} from "@/utils/utils";
import {useLocale, useOrderHook} from "@/hooks";
import {Badge, Button, Collapsable} from "@/components";
import {localized} from "@/lib/i18n-content";
import {BASE_URL} from "@/lib/api-client";
import type {DocumentStatus} from "@/types";

type Props = {
    order: Order;
};

function OrderPositionRow({op}: { op: OrderPosition }) {
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

function OrderFlatRateRow({fr}: { fr: OrderFlatRate }) {
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

function OrderDocumentItem({order, orderDoc}: { order: Order; orderDoc: OrderDocument }) {
    const [status, setStatus] = useState<DocumentStatus>(orderDoc.document.status);

    return (
        <div className="flex items-center justify-between border border-(--border) py-2 pl-4 pr-2 rounded-md gap-2">
            <div className="w-full flex items-center gap-4">
                <div className="flex items-center gap-2">
                    {status === "GENERATED" && <File className="size-4.5"/>}
                    {(status === "PENDING" || status === "PROCESSING" || status === "UPLOADING") && (
                        <Loader className="size-4 animate-spin"/>
                    )}
                </div>
                <div className="w-full flex flex-col justify-between">
                    <h1 className="text-md">{orderDoc.document.displayName}</h1>
                    <p className="text-sm text-(--text-secondary)">{orderDoc.document.status}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {status === "GENERATED" && (
                    <>
                        <a href={`${BASE_URL}/api/orders/${order.id}/documents/${orderDoc.document.id}/pdf`} download>
                            <Button variant="secondary" size="sm" icon={<Download className="size-3.5"/>} iconOnly title="PDF herunterladen"/>
                        </a>
                        <a href={`${BASE_URL}/api/orders/${order.id}/documents/${orderDoc.document.id}/docx`} download>
                            <Button variant="secondary" size="sm" icon={<File className="size-3.5"/>} iconOnly title="DOCX herunterladen"/>
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}

export default function OrderCard({order}: Props) {
    const {
        customerContactPerson: ccp,
        orderId,
        orderPositions,
        flatRates,
        customer,
    } = order;
    const {
        deleteOrder,
        errorDeletingOrder,
        generateDocument,
        isGeneratingDocument,
    } = useOrderHook();

    useEffect(() => {
        if (errorDeletingOrder) {
            toast.error(`${errorDeletingOrder}`);
        }
    }, [errorDeletingOrder]);

    const handleDeleteOrder = () => {
        if (confirm("Bestellung löschen")) {
            deleteOrder(order.id);
        }
    };

    return (
        <div className="border border-(--border) rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) relative">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-md">
                            <span className="text-(--text)">{customer.companyName}</span>
                            <span>-</span>
                            <span>BE{orderId}</span>
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
                            <label className="text-(--text-secondary)">Bestell-Nr.:</label>
                            <p className="text-(--text)">{orderId}</p>
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

                <div className="flex flex-col items-end">
                    <p className="text-md font-semibold">{formatEur(order.net_amount)}</p>
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
                    {orderPositions.map((op, i) => (
                        <OrderPositionRow key={i} op={op}/>
                    ))}
                    {flatRates.map((fr, i) => (
                        <OrderFlatRateRow key={i} fr={fr}/>
                    ))}
                    <LineItemRow
                        left={
                            <span className="text-sm text-(--text-secondary) font-light">
                                Gesamtpreis
                            </span>
                        }
                        right={<p>{formatEur(order.net_amount)}</p>}
                    />
                </div>
            </Collapsable>

            <Collapsable
                label="Dokumente"
                className="w-full bg-(--subtle-50) justify-between rounded-none"
            >
                <div className="grid gap-2 px-4 py-3">
                    {order.orderDocuments.map((orderDoc: OrderDocument) => (
                        <OrderDocumentItem
                            key={orderDoc.id}
                            order={order}
                            orderDoc={orderDoc}
                        />
                    ))}

                    <Button
                        className="min-w-fit"
                        variant="primary"
                        size="sm"
                        loading={isGeneratingDocument}
                        disabled={isGeneratingDocument}
                        onClick={() => generateDocument({orderId: order.id})}
                    >
                        Dokument generieren
                    </Button>
                </div>
            </Collapsable>

            <div className="flex items-center justify-between px-2 py-2 border-t border-(--border)">
                <div className="flex items-center gap-2"></div>
                <div className="flex items-center gap-2">
                    <Button
                        size="xs"
                        variant="secondary"
                        onClick={handleDeleteOrder}
                        icon={<Trash className="size-3"/>}
                        iconOnly
                    />
                </div>
            </div>
        </div>
    );
}
