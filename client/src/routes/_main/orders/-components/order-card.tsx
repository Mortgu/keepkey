import { useOrderHook } from "@/hooks";
import { Trash } from "lucide-react";
import { formatDate } from "@/lib/format.ts";
import React from "react";
import type { Document, Order, OrderPosition } from "@/types";
import { Button, Collapsable } from "@/components";
import { DocumentItem } from "@/routes/_main/offers/-components/card-components";

type Props = {
    order: Order
};

export default function OrderCard({ order }: Props) {
    const { deleteOrder, errorDeletingOrder, isDeleting } = useOrderHook();

    return (
        <React.Fragment>
            {errorDeletingOrder && (
                <p className="text-(--destructive) text-md">{errorDeletingOrder.message}</p>
            )}
            <div className="grid border border-(--border) rounded-md">
                <div className="flex items-center justify-between border-b border-(--border) px-3 py-2">
                    <div className="flex-1">
                        <p className="text-md">BE{order.orderId}</p>
                        <p className="text-sm font-light text-(--text-secondary)">
                            {formatDate(order?.createdAt || '')}
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button
                            loading={isDeleting}
                            onClick={() => deleteOrder(order.id)}
                            size="sm"
                            variant="secondary"
                            iconOnly
                            icon={<Trash className="size-3.5" />}
                        />
                    </div>
                </div>

                <div className="">
                    {order.orderPositions.map((position: OrderPosition) => (
                        <div key={position.id}
                            className="flex items-center justify-between border-b border-(--border) px-3 py-2">
                            <div className="flex items-center gap-2">
                                <p>{position.product.name}</p>
                                <p className="text-gray-500">
                                    ({position.contract.name} / {position.duration_months} Monate)
                                </p>
                            </div>
                            <p>0 €</p>
                        </div>
                    ))}
                </div>

                <Collapsable label="Dokumente" className="w-full bg-(--subtle-50) justify-between rounded-none">
                    <div className="grid gap-2 px-3 py-2">
                        {order.documents?.map((document: Document) => (
                            <DocumentItem key={document.id} document={document} />
                        ))}
                    </div>
                </Collapsable>
            </div>
        </React.Fragment>
    );
}
