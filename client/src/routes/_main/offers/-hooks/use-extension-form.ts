import { useForm, useStore } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import {

    createOfferSchema
} from '@keepit/schemas';
import useOfferModal from "../-hooks/use-offer.offer-modal";
import type { Offer } from '@keepit/schemas';
import { useOfferManager } from "@/hooks";


interface Props {
    currentOffer?: Offer;
    closeFn: () => void;
    preselectedCustomerId?: string;
}

export default function useExtensionForm({ currentOffer, closeFn, preselectedCustomerId }: Props) {
    const {
        defaultValues,
        suggestedQuoteId,
        isLoadingQuoteId,
        quoteIdCloudChecked,
    } = useOfferModal({ currentOffer, preselectedCustomerId });
    const { createOffer, updateOffer } = useOfferManager();

    const [expectedVersion] = useState(currentOffer?.version);

    const form = useForm({
        defaultValues: defaultValues,
        validators: {
            onMount: createOfferSchema,
            onChange: createOfferSchema
        },
        onSubmit: async ({ value }) => {
            if (currentOffer) {
                await updateOffer({
                    offerId: currentOffer.id,
                    input: { ...value, expectedVersion: expectedVersion! },
                });
            } else {
                await createOffer(value);
            }

            closeFn();
        },
    });

    const customerId = useStore(form.store, (s) => s.values.customerId);

    // Der Vorschlag trifft erst nach dem Mount ein, `defaultValues` ist da schon eingefroren.
    // Nachtragen nur, solange das Feld leer ist — was der Nutzer selbst getippt hat, bleibt stehen.
    useEffect(() => {
        if (currentOffer || !suggestedQuoteId) return;
        if (form.getFieldValue("quoteId")) return;

        form.setFieldValue("quoteId", suggestedQuoteId);
    }, [currentOffer, suggestedQuoteId, form]);

    // Die Belegnummer ist der Dateipräfix des Dokuments — sobald eines existiert, liegt sie fest.
    // Der Server lehnt eine Änderung ohnehin ab, hier geht es nur um die Anzeige.
    const quoteIdLocked = Boolean(
        currentOffer?.offerDocuments.some((document) => document.status !== "FAILED"),
    );

    return {
        form,
        customerId,
        quoteIdLocked,
        isLoadingQuoteId,
        quoteIdCloudChecked,
    }
}

export type ExtensionFormApi = ReturnType<typeof useExtensionForm>["form"];