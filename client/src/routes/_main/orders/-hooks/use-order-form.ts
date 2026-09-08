import { z } from "zod";
import { useState } from "react";
import {   orderMetadataSchema } from "@keepit/schemas";
import { useForm } from "@tanstack/react-form";
import type {Offer, Order} from "@keepit/schemas";
import { useCreateOrder, useUpdateOrder } from "@/hooks";

const formSchema = orderMetadataSchema.extend({
    date: orderMetadataSchema.shape.date.or(z.literal("")),
    projectNumber: z.string(),
    projectDescription: z.string(),
    orderDetails: z.string(),
});

interface Props {
    currentOrder?: Order;
    currentOffer?: Offer;
    onDone: () => void;
}

export default function useOrderForm({ currentOrder, currentOffer, onDone }: Props) {
    const create = useCreateOrder();
    const update = useUpdateOrder();
    // Pin the version the user opened; a background refetch must not silently accept another version.
    const [expectedVersion] = useState(() => currentOrder?.version ?? currentOffer?.version);
    const form = useForm({
        defaultValues: {
            orderId: currentOrder?.orderId ?? "",
            date: currentOrder?.date.slice(0, 10) ?? "",
            projectNumber: currentOrder?.projectNumber ?? "",
            projectDescription: currentOrder?.projectDescription ?? "",
            orderDetails: currentOrder?.orderDetails ?? "",
        },
        validators: { onChange: formSchema, onSubmit: formSchema },
        onSubmit: async ({ value }) => {
            if (expectedVersion === undefined) return;
            try {
                if (currentOrder) {
                    await update.updateOrder({ orderId: currentOrder.id, input: {
                        expectedVersion, order: { ...value, date: value.date || currentOrder.date,
                            projectNumber: value.projectNumber || null, projectDescription: value.projectDescription || null,
                            orderDetails: value.orderDetails || null },
                    } });
                } else if (currentOffer) {
                    await create.createOrder({ ...value, id: currentOffer.id, expectedOfferVersion: expectedVersion,
                        date: value.date || undefined });
                } else return;
                onDone();
            } catch {
                // Keep the dialog and entered values open; mutation.error is rendered by the dialog.
            }
        },
    });
    return { form, error: update.errorUpdatingOrder ?? create.errorCreatingOrder };
}
