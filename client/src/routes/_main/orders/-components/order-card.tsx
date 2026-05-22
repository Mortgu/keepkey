import { useOrderHook } from "@/hooks";
import { Pen, Trash } from "lucide-react";
import { formatDate } from "@/lib/format.ts";
import React, { useState } from "react";
import type { Order, OrderPosition } from "@/types";
import { Button } from "@/components";

type Props = {
  order: Order
};

export default function OrderCard({ order }: Props) {
  const { deleteOrder, errorCreatingOrder, errorDeletingOrder, isDeleting, isCreatingOrder } = useOrderHook();

  const [isOpen, setOpen] = useState<boolean>(false);

  return (
    <React.Fragment >
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
              onClick={() => setOpen(true)}
              size="sm"
              variant="secondary"
              iconOnly
              icon={<Pen className="size-3.5" />}
            />

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
        {/* Products */}
        <div className="">
          {order.orderPositions.map((position: OrderPosition) => (
            <div className="flex items-center justify-between border-b border-(--border) px-3 py-2 ">
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

      </div>


    </React.Fragment>
  );
}
