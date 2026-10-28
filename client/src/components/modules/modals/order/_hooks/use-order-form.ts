import { z } from "zod";
import { useState } from "react";
import { orderMetadataSchema, purchasePositionInputSchema } from "@keepit/schemas";
import { useForm } from "@tanstack/react-form";
import type { Offer, Order, PurchasePositionInput } from "@keepit/schemas";
import { useCreateOrder, useUpdateOrder } from "@/hooks";

export const orderFormSchema = orderMetadataSchema.extend({
    date: orderMetadataSchema.shape.date.or(z.literal("")),
    contractStartDate: orderMetadataSchema.shape.date.or(z.literal("")),
    projectNumber: z.string(),
    projectDescription: z.string(),
    orderDetails: z.string(),
    /**
     * Gesamtbetrag je Snapshot-Position in Cent. Im Formular `null`, solange
     * nichts eingegeben ist — jede Position ist Pflicht, 0 € ist erlaubt.
     */
    positions: z.array(purchasePositionInputSchema.extend({
        purchase_total_cents: purchasePositionInputSchema.shape.purchase_total_cents.nullable()
            .refine((v) => v !== null, { message: "required" }),
    })).min(1),
});

export type OrderFormValues = z.input<typeof orderFormSchema>;
export type PurchaseValue = OrderFormValues["positions"][number];

/** Nach der Validierung ist jeder Betrag gesetzt. */
export const toPurchaseInput = (positions: Array<PurchaseValue>): Array<PurchasePositionInput> =>
    positions.map((p) => ({ offerPositionId: p.offerPositionId, purchase_total_cents: p.purchase_total_cents ?? 0 }));

/**
 * Eine Zeile der Einkaufspreistabelle. Beim Anlegen kommt das Produkt aus dem
 * Angebot, beim Bearbeiten aus der Bestellung — die Tabelle selbst ist in
 * beiden Fällen dieselbe.
 */
export type PurchaseRow = {
    offerPositionId: string;
    productName: Array<{ language: "DE" | "EN"; name: string }>;
    quantity: number;
    duration_months: number;
};

export function purchaseRows(currentOrder?: Order, currentOffer?: Offer): Array<PurchaseRow> {
    if (currentOrder) {
        const byId = new Map(currentOrder.orderPositions.map((p) => [p.id, p]));
        return currentOrder.supplierPositions.map((sp) => ({
            offerPositionId: sp.offerPositionId,
            productName: byId.get(sp.offerPositionId)?.product.translations ?? [],
            quantity: sp.quantity,
            duration_months: currentOrder.duration_months,
        }));
    }
    if (currentOffer) {
        return currentOffer.offerPositions.map((op) => ({
            offerPositionId: op.id,
            productName: op.product.translations,
            quantity: op.quantity,
            duration_months: currentOffer.duration_months,
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
            // Beim Bearbeiten der gespeicherte Betrag, beim Anlegen leer.
            positions: rows.map((row): PurchaseValue => ({
                offerPositionId: row.offerPositionId,
                purchase_total_cents: currentOrder?.supplierPositions
                    .find((sp) => sp.offerPositionId === row.offerPositionId)?.purchase_total_cents
                    ?? null,
            })),
        },
        validators: { onChange: orderFormSchema, onSubmit: orderFormSchema },
        onSubmit: async ({ value }) => {
            if (expectedVersion === undefined) return;
            try {
                const { positions: values, ...metadata } = value;
                const positions = toPurchaseInput(values);
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
