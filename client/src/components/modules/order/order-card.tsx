import OrderModal from "@/routes/_main/orders/-components/modal/order-modal";
import OrderCardBody from "./order-card-body";
import OrderCardHead from "./order-card-head";
import orderModal from "@/routes/_main/orders/-components/modal/order-modal";
import { useOrder } from "@/hooks";
import { LoaderCircle } from "lucide-react";

type Props = {
    orderId: string;
};

export default function OrderCard({ orderId }: Props) {
    const { order, isPending, error } = useOrder(orderId);

    if (isPending) {
        return <LoaderCircle className="size-4 animate-spin" />
    }

    if (error) {
        return (
            <div>{error.message}</div>
        )
    }

    if (!order) {
        return null;
    }

    return (
        <div className="border border-(--border) rounded-md data-[accepted=true]" data-accepted={locked}>
            {order && (
                <OrderCardHead order={order} />
            )}

            {/* Products / Workloads */}
            <OrderCardBody
                orderPositions={order.orderPositions}
                orderDocuments={order.documents}
                locked={locked}
                orderId={order.id}

                openAccordionSection={openAccordionSection}
                setOpenAccordionSection={setOpenAccordionSection}
            />

            {orderModal.isOpen && (
                <OrderModal
                    key={orderModal.key}
                    onClose={orderModal.close}
                />
            )}
        </div>
    )
}

