import { z } from "zod";
import { useState } from "react";
import { orderMetadataSchema, purchasePositionInputSchema } from "@keepit/schemas";
import { useForm } from "@tanstack/react-form";
import type {Offer, Order} from "@keepit/schemas";
import { useCreateOrder, useUpdateOrder } from "@/hooks";

export const orderFormSchema = orderMetadataSchema.extend({
    date: orderMetadataSchema.shape.date.or(z.literal("")),
    contractStartDate: orderMetadataSchema.shape.date.or(z.literal("")),
    projectNumber: z.string(),
    projectDescription: z.string(),
    orderDetails: z.string(),
    /** Einkaufspreise je Snapshot-Position, in Cent. */
    positions: z.array(purchasePositionInputSchema).min(1),
});

/**
 * Eine Zeile der Einkaufspreistabelle. Beim Anlegen kommen Produkt und Verkaufs-
 * preis aus dem Angebot, beim Bearbeiten aus der Bestellung — die Tabelle selbst
 * ist in beiden Fällen dieselbe.
 */
export type OrderFormValues = z.infer<typeof orderFormSchema>;

export type PurchaseRow = {
    offerPositionId: string;
    productName: Array<{ language: "DE" | "EN"; name: string }>;
    quantity: number;
    free_months: number;
    duration_months: number;
    /** Verkaufspreis je User/Monat in Cent. */
    eur_user_month: number;
};

export function purchaseRows(currentOrder?: Order, currentOffer?: Offer): Array<PurchaseRow> {
    if (currentOrder) {
        const byId = new Map(currentOrder.orderPositions.map((p) => [p.id, p]));
        return currentOrder.supplierPositions.map((sp) => ({
            offerPositionId: sp.offerPositionId,
            productName: byId.get(sp.offerPositionId)?.product.translations ?? [],
            quantity: sp.quantity,
            free_months: sp.free_months,
            duration_months: currentOrder.duration_months,
            eur_user_month: sp.eur_user_month,
        }));
    }
    if (currentOffer) {
        return currentOffer.offerPositions.map((op) => ({
            offerPositionId: op.id,
            productName: op.product.translations,
            quantity: op.quantity,
            free_months: op.free_months,
            duration_months: currentOffer.duration_months,
            eur_user_month: op.eur_user_month,
        }));
    }
    return [];
}

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
    const rows = purchaseRows(currentOrder, currentOffer);
    const form = useForm({
        defaultValues: {
            orderId: currentOrder?.orderId ?? "",
            date: currentOrder?.date.slice(0, 10) ?? "",
            contractStartDate: currentOrder?.contractStartDate?.slice(0, 10) ?? "",
            projectNumber: currentOrder?.projectNumber ?? "",
            projectDescription: currentOrder?.projectDescription ?? "",
            orderDetails: currentOrder?.orderDetails ?? "",
            // Vorbelegt mit dem gespeicherten Einkaufspreis, sonst mit dem Verkaufspreis.
            positions: rows.map((row) => ({
                offerPositionId: row.offerPositionId,
                purchase_eur_user_month: currentOrder?.supplierPositions
                    .find((sp) => sp.offerPositionId === row.offerPositionId)?.purchase_eur_user_month
                    ?? row.eur_user_month,
            })),
        },
        validators: { onChange: orderFormSchema, onSubmit: orderFormSchema },
        onSubmit: async ({ value }) => {
            if (expectedVersion === undefined) return;
            try {
                const { positions, ...metadata } = value;
                if (currentOrder) {
                    await update.updateOrder({ orderId: currentOrder.id, input: {
                        expectedVersion,
                        order: { ...metadata, date: metadata.date || currentOrder.date,
                            contractStartDate: metadata.contractStartDate || null,
                            projectNumber: metadata.projectNumber || null, projectDescription: metadata.projectDescription || null,
                            orderDetails: metadata.orderDetails || null },
                        positions,
                    } });
                } else if (currentOffer) {
                    await create.createOrder({ ...metadata, positions, id: currentOffer.id, expectedOfferVersion: expectedVersion,
                        date: metadata.date || undefined, contractStartDate: metadata.contractStartDate || undefined });
                } else return;
                onDone();
            } catch {
                // Keep the dialog and entered values open; mutation.error is rendered by the dialog.
            }
        },
    });
    return { form, rows, error: update.errorUpdatingOrder ?? create.errorCreatingOrder };
}
