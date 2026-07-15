import { History, Pencil, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import OrderDrawerHistory from "../order-drawer-history";
import OrderEditModal from "../order-edit-modal";
import OrderCardDocument from "./order-card-document";
import OrderCardFlatRate from "./order-card-flatrate";
import OrderCardProduct from "./order-card-product";
import type { Order, OrderDocument } from "@/types";
import { formatEur } from "@/utils/utils";
import { formatDate } from "@/lib/format";
import { useOrderHook } from "@/hooks";
import { Button, Collapsable } from "@/components";

type Props = {
    order: Order;
};

export default function OrderCard({ order }: Props) {
    const [historyOpen, setHistoryOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
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

            <Collapsable label="Produkte" className="w-full bg-(--subtle-50) justify-between rounded-none">
                <div className="grid">
                    {orderPositions.map((position, i) => (
                        <OrderCardProduct key={i} position={position} />
                    ))}

                    {flatRates.map((flatrate, i) => (
                        <OrderCardFlatRate key={i} flatrate={flatrate} />
                    ))}
                </div>
            </Collapsable>

            <Collapsable label="Dokumente" className="w-full bg-(--subtle-50) justify-between rounded-none">
                <div className="grid mx-4">
                    {order.documents.map((document: OrderDocument) => (
                        <OrderCardDocument key={document.id} orderDocument={document} />
                    ))}
                </div>
            </Collapsable>

            <div className="flex items-center justify-between px-2 py-2 border-t border-(--border)">
                {/* Actions left */}
                <div className="flex items-center gap-2">
                    <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => setHistoryOpen(true)}
                        icon={<History className="size-3" />}
                        iconOnly
                        title="Versionsverlauf"
                    />
                    <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => setEditOpen(true)}
                        icon={<Pencil className="size-3" />}
                        iconOnly
                        title="Bestellung bearbeiten"
                    />
                    <Button
                        className="min-w-fit"
                        variant="primary"
                        size="sm"
                        loading={isGeneratingDocument}
                        disabled={isGeneratingDocument}
                        onClick={() => generateDocument({ orderId: order.id })}
                    >
                        Dokument generieren
                    </Button>
                </div>

                {/* Actions right */}
                <div className="flex items-center gap-2">
                    <Button
                        size="xs"
                        variant="secondary"
                        onClick={handleDeleteOrder}
                        icon={<Trash className="size-3" />}
                        iconOnly
                    />
                </div>
            </div>
            <OrderDrawerHistory open={historyOpen} onClose={() => setHistoryOpen(false)} order={order} />
            {editOpen && <OrderEditModal order={order} onClose={() => setEditOpen(false)} />}
        </div>
    );
}
