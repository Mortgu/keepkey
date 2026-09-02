import type { Order } from "@keepit/schemas";

import { Accordion, Button } from "@/components";
import DocumentCard from "@/routes/_main/-components/card/document-card";
import FlatRateRow from "@/routes/_main/-components/card/flatrate-row";
import PositionRow from "@/routes/_main/-components/card/position-row";
import { useGenerateOrderDocument } from "@/hooks/orders/order-mutations";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";

interface Props {
    order: Order;
}

export default function OrderCard({ order }: Props) {
    const { customer, customerContactPerson: ccp, orderPositions, flatRates, documents } = order;

    const { generateOrderDocument, isGeneratingDocument } = useGenerateOrderDocument();

    return (
        <div className="bg-white border border-(--border) rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) relative">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-md">
                            <span className="text-(--text) font-semibold">BE{order.orderId}</span>
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

                <div className="flex flex-col items-end">
                    <p className="text-md font-mono font-medium">{formatEur(order.net_amount)}</p>
                    <p className="text-(--text-secondary) font-light text-sm">
                        Gesamtpreis
                    </p>
                </div>
            </div>

            <Accordion>
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
                        disabled={isGeneratingDocument}
                        onClick={() => generateOrderDocument({ orderId: order.id })}
                    >
                        Dokument generieren
                    </Button>
                </div>

                {/* Actions right */}
                <div className="flex items-center gap-2">

                </div>
            </div>

        </div>
    );
}
