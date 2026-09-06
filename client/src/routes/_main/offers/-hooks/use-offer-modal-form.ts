import { useForm, useStore } from "@tanstack/react-form";
import { useState } from "react";
import { OFFER_MODAL_POLICIES } from "../-components/modals/offer-modal-policy";
import { offerModalSchema } from "../-schemas/offer-modal-schema";
import useOfferModal from "./use-offer.offer-modal";
import usePricingStatus from "./use-pricing-status.offer-modal";
import type { CreateOfferInput, ExtendOfferInput, Offer } from "@keepit/schemas";
import type { OfferModalMode } from "../-components/modals/offer-modal-policy";
import type { OfferModalValues } from "../-schemas/offer-modal-schema";
import { useExtendOffer, useOfferManager, useRenewOffer } from "@/hooks";

interface Props {
    mode: OfferModalMode;
    /** Beim Bearbeiten die Vorlage, bei abgeleiteten Angeboten das Quellangebot. */
    sourceOffer?: Offer;
    onClose: () => void;
    preselectedCustomerId?: string;
}

/**
 * Wirft das modalinterne `sourcePositionId` ab: Es dient nur der Zuordnung zur
 * Quellposition und gehört nicht in die Nutzlast eines vollständigen Angebots.
 */
function toCreateInput(values: OfferModalValues): CreateOfferInput {
    return {
        ...values,
        offerPositions: values.offerPositions.map((position) => ({
            productId: position.productId,
            free_months: position.free_months,
            quantity: position.quantity,
            optional: position.optional,
            total_cents: position.total_cents,
            eur_user_month: position.eur_user_month,
            discount_cents: position.discount_cents,
        })),
    };
}

/**
 * Übersetzt die Formularwerte in die schmale Erweiterungs-Nutzlast.
 *
 * Jede Position verweist über ihre `sourcePositionId` auf das Quellangebot —
 * Positionen ohne Verweis kann eine Erweiterung nicht abbilden und lässt sie
 * daher weg. Preise stehen bewusst nicht im Body: Der Server löst sie aus der
 * angepinnten Tarif-Version auf.
 */
function toExtendInput(values: OfferModalValues): ExtendOfferInput {
    return {
        quoteId: values.quoteId,
        validUntil: values.validUntil,
        requestFrom: values.requestFrom,
        positions: values.offerPositions.flatMap((position) =>
            position.sourcePositionId === undefined
                ? []
                : [{ sourcePositionId: position.sourcePositionId, quantity: position.quantity }],
        ),
        discounts: values.discounts,
    };
}

/**
 * Das Formular hinter allen drei Angebotstypen.
 *
 * Zustand und Validierung sind für Angebot, Verlängerung und Erweiterung
 * identisch; verschieden sind nur die Startwerte (siehe Policy) und die
 * Mutation beim Speichern.
 */
export default function useOfferModalForm({ mode, sourceOffer, onClose, preselectedCustomerId }: Props) {
    const policy = OFFER_MODAL_POLICIES[mode];

    const { defaultValues } = useOfferModal({ currentOffer: sourceOffer, preselectedCustomerId });
    const { createOffer, updateOffer } = useOfferManager();
    const { renewOffer } = useRenewOffer();
    const { extendOffer } = useExtendOffer();

    // Nur beim Bearbeiten relevant, und dann die Version, mit der das Modal
    // geöffnet wurde — sie entscheidet über den Konflikt beim Speichern.
    const [expectedVersion] = useState(sourceOffer?.version);

    const form = useForm({
        defaultValues: {
            ...defaultValues,
            quoteId: policy.resetQuoteId ? "" : defaultValues.quoteId,
            flatrates: policy.flatrates.startEmpty ? [] : defaultValues.flatrates,
            discounts: policy.discounts.startEmpty ? [] : defaultValues.discounts,
        } satisfies OfferModalValues,
        validators: {
            onMount: offerModalSchema,
            onChange: offerModalSchema,
        },
        onSubmit: async ({ value }) => {
            if (mode === "renewal" && sourceOffer) {
                await renewOffer({ offerId: sourceOffer.id, input: toCreateInput(value) });
            } else if (mode === "extension" && sourceOffer) {
                await extendOffer({ offerId: sourceOffer.id, input: toExtendInput(value) });
            } else if (sourceOffer) {
                await updateOffer({
                    offerId: sourceOffer.id,
                    input: { ...toCreateInput(value), expectedVersion: expectedVersion! },
                });
            } else {
                await createOffer(toCreateInput(value));
            }

            onClose();
        },
    });

    // Der Teil der Preiskoordinate, den alle Positionen teilen. Als ein Wert,
    // damit jede Position ihn unverändert weiterreicht, statt drei Felder
    // einzeln durch den Baum zu tragen.
    const header = useStore(form.store, (s) => ({
        customerId: s.values.customerId,
        contractId: s.values.contractId,
        duration_months: s.values.duration_months,
    }));

    const positions = useStore(form.store, (s) => s.values.offerPositions);

    const pricing = usePricingStatus({
        header,
        source: policy.priceSource,
        sourceOfferId: sourceOffer?.id,
        positions,
    });

    return {
        form,
        policy,
        header,
        pricing,
    };
}

export type OfferModalFormApi = ReturnType<typeof useOfferModalForm>["form"];
