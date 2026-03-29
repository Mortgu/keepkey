import DocumentStatus from "@/components/document-status";
import type { Order } from "@/data/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { useEffect, useRef, useState } from "react";

export default function OrderListItem({ order, key }: { order: Order, key: number | string, }) {
    const [isOpen, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen]);

    return (
        <div key={key} className="flex gap-2 border-b py-4 border-gray-200 first:border-t">
            <div className="w-full flex items-center justify-between ">
                <div className="grid gap-1">
                    <h1 className="font-semibold">{formatDate(order.createdAt)}</h1>
                    <div className="flex gap-2">
                        {order.orderPositions.map(i => (
                            <p className="text-gray-500 hover:underline cursor-pointer text-sm w-fit rounded-md">
                                {i.quantity}x {i.product.name} ({formatCurrency(i.priceAtPurchase)})
                            </p>
                        ))}
                    </div>
                </div>
                <div className="flex items-center relative">

                    {/* Tasks */}
                    <div className="">
                        <DocumentStatus orderId={order.id} />
                    </div>


                </div>
            </div>
        </div>
    );
}