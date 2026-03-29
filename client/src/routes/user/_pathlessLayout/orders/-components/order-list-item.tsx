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
                    <p className="text-gray-600 text-sm">
                        {order.orderPositions.map((position, idx) => (
                            <span key={position.id || idx}>
                                {idx > 0 && <span className="mx-1">,</span>}
                                <span className="hover:text-gray-900 cursor-pointer">
                                    {position.quantity}x {position.product.name}
                                    {position.contract && <span className="text-gray-400"> ({position.contract.name})</span>}
                                    <span className="font-medium"> {formatCurrency(position.priceAtPurchase)}</span>
                                </span>
                            </span>
                        ))}
                    </p>
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