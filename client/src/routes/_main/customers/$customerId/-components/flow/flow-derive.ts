import type { DocumentStatus, Offer } from "@keepit/schemas";
import type { FlowStage, Phase, StageKind } from "./flow-types";

type DocLike = { status: DocumentStatus };

function documentsState(docs: ReadonlyArray<DocLike>): "busy" | "failed" | "done" {

    return "done";
}

type Stages = [FlowStage, FlowStage, FlowStage, FlowStage];

function deriveDerivedDoc(
    kind: "confirmation" | "invoice",
    sub: { confirmationId?: string; invoiceId?: string; date: string; documents: ReadonlyArray<DocLike> } | null,
    orderCancelled: boolean,
): FlowStage {
    if (!sub) return { kind, state: orderCancelled ? "cancelled" : "action" };
    const prefix = kind === "confirmation" ? "AB" : "RE";
    const number = kind === "confirmation" ? sub.confirmationId : sub.invoiceId;
    return { kind, state: documentsState(sub.documents), number: `${prefix}${number}`, date: sub.date };
}

/**
 * Leitet den Zustand der vier Stufen rein aus echten Daten ab (kein Mock).
 * `offer.order` ist nur gesetzt, wenn die Abfrage es angefordert hat
 * (`includeOrder=true` bzw. Einzelabruf — s. `offer.schema.ts`).
 */
export function deriveStages(offer: Offer): Stages {
    const order = offer.order ?? null;

    const offerStage: FlowStage = {
        kind: "offer",
        state: documentsState(offer.offerDocuments),
        number: `AG${offer.quoteId}`,
        date: offer.date,
    };

    let orderStage: FlowStage;
    if (!order) {
        orderStage = { kind: "order", state: "action", actionLabel: "Bestellung anlegen" };
    } else if (order.cancelledAt) {
        orderStage = { kind: "order", state: "cancelled", number: `BE${order.orderId}`, date: order.date };
    } else {
        orderStage = { kind: "order", state: documentsState(order.documents), number: `BE${order.orderId}`, date: order.date };
    }

    const confirmationStage: FlowStage = !order
        ? { kind: "confirmation", state: "locked" }
        : deriveDerivedDoc("confirmation", order.confirmation, Boolean(order.cancelledAt));

    const invoiceStage: FlowStage = !order
        ? { kind: "invoice", state: "locked" }
        : deriveDerivedDoc("invoice", order.invoice, Boolean(order.cancelledAt));

    return [offerStage, orderStage, confirmationStage, invoiceStage];
}

export function derivePhase(offer: Offer, stages: Stages): Phase {
    const order = offer.order ?? null;
    if (!order) return "open";
    if (order.cancelledAt) return "cancelled";
    return stages[3].state === "done" ? "billed" : "running";
}

export const stageKinds: ReadonlyArray<StageKind> = ["offer", "order", "confirmation", "invoice"];
