import { useCallback, useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { orderFormSchema, purchaseRows } from "./use-order-form";
import type { OrderFormValues } from "./use-order-form";
import type { Offer } from "@keepit/schemas";
import { useCreateOrder } from "@/hooks";

interface Props {
    /** Vorausgewähltes Angebot (Einstieg von der Angebotskarte). */
    initialOffer?: Offer;
    onCreated: () => void;
}

/** Startwerte für ein Angebot: Bestelldaten leer, Einkaufspreise = Verkaufspreise. */
export function defaultsFor(offer: Offer): OrderFormValues {
    return {
        orderId: "",
        date: "",
        contractStartDate: "",
        projectNumber: "",
        projectDescription: "",
        orderDetails: "",
        positions: purchaseRows(undefined, offer).map((row) => ({
            offerPositionId: row.offerPositionId,
            purchase_eur_user_month: row.eur_user_month,
        })),
    };
}

const EMPTY: OrderFormValues = {
    orderId: "", date: "", contractStartDate: "", projectNumber: "", projectDescription: "", orderDetails: "", positions: [],
};

/**
 * Zustand des Dialogs „Bestellung anlegen“: gewähltes Angebot plus Formular.
 *
 * Ein eigener Hook statt `useOrderForm`, weil das Formular hier das Angebot
 * überlebt: Beim Wechsel wird es mit den Werten des neuen Angebots zurück-
 * gesetzt, Liste und Suche bleiben stehen. Die Angebotsversion wird bei der
 * Auswahl gepinnt — ein Refetch im Hintergrund darf nicht stillschweigend eine
 * andere Version annehmen.
 */
export default function useOrderModal({ initialOffer, onCreated }: Props) {
    const [offer, setOffer] = useState<Offer | undefined>(initialOffer);
    const pinned = useRef<{ id: string; version: number } | undefined>(
        initialOffer ? { id: initialOffer.id, version: initialOffer.version } : undefined,
    );
    const create = useCreateOrder();

    const form = useForm({
        defaultValues: initialOffer ? defaultsFor(initialOffer) : EMPTY,
        validators: { onChange: orderFormSchema, onSubmit: orderFormSchema },
        onSubmit: async ({ value }) => {
            const target = pinned.current;
            if (!target) return;
            try {
                const { positions, ...metadata } = value;
                await create.createOrder({
                    ...metadata,
                    positions,
                    id: target.id,
                    expectedOfferVersion: target.version,
                    date: metadata.date || undefined,
                    contractStartDate: metadata.contractStartDate || undefined,
                });
                onCreated();
            } catch {
                // Dialog bleibt offen; der Fehler wird aus `error` gerendert.
            }
        },
    });

    const select = useCallback((next: Offer) => {
        pinned.current = { id: next.id, version: next.version };
        setOffer(next);
        form.reset(defaultsFor(next));
    }, [form]);

    return {
        offer,
        select,
        form,
        rows: offer ? purchaseRows(undefined, offer) : [],
        error: create.errorCreatingOrder,
        isCreating: create.isCreatingOrder,
    };
}
