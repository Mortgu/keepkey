import { useForm } from "@tanstack/react-form";
import { createOfferSchema } from "@keepit/schemas";
import type { CreateOfferInput, ExtendOfferInput, Offer } from "@keepit/schemas";
import type { PriceSource } from "@/hooks";
import { useExtendOffer, useRenewOffer } from "@/hooks";
import useOfferModal from "@/routes/_main/offers/-hooks/use-offer.offer-modal";

/**
 * Beide abgeleiteten Angebotstypen teilen sich dieses Formular.
 *
 * - `renewal`: Verlängerung, rechnet zum aktuellen Tarif neu.
 * - `extension`: Lizenzerweiterung, behält den Preis der Quellposition.
 *   Nur die Menge darf abweichen; Flatrates und Rabatte entfallen.
 */
export type DerivedMode = "renewal" | "extension";

/**
 * Woher der Preis einer Position dieses Angebotstyps kommt.
 *
 * Eine Verlängerung soll die aktuellen Konditionen zeigen, eine Erweiterung die
 * von damals — deshalb liest letztere aus der Tarif-Version, die die
 * Quellposition angepinnt hat.
 */
export const priceSourceFor = (mode: DerivedMode): PriceSource =>
    mode === "extension" ? "pinned" : "live";

interface Props {
    offer: Offer;
    mode: DerivedMode;
    closeFn: () => void;
}

/**
 * Übersetzt die Formularwerte in die schmale Erweiterungs-Nutzlast.
 *
 * Die Positionen werden per Index mit dem Quellangebot gepaart — dieselbe
 * Kopplung, die der Baum ohnehin für die Vorher/Nachher-Anzeige nutzt. Preise
 * werden bewusst nicht mitgeschickt: Der Server löst sie aus der angepinnten
 * Tarif-Version auf.
 */
function toExtendInput(offer: Offer, values: CreateOfferInput): ExtendOfferInput {
    return {
        quoteId: values.quoteId,
        validUntil: values.validUntil,
        requestFrom: values.requestFrom,
        positions: values.offerPositions.flatMap((position, index) => {
            // `.at()` statt `[index]`: Der Index-Zugriff wird sonst als immer
            // definiert typisiert, obwohl die Liste kürzer sein kann.
            const source = offer.offerPositions.at(index);
            if (source === undefined) return [];

            return [{ sourcePositionId: source.id, quantity: position.quantity }];
        }),
        discounts: values.discounts,
    };
}

export default function useDerivedForm({ offer, mode, closeFn }: Props) {
    const { defaultValues } = useOfferModal({ currentOffer: offer });
    const { renewOffer } = useRenewOffer();
    const { extendOffer } = useExtendOffer();

    const form = useForm({
        // In der Erweiterung gibt es keine Pauschalen und keine übernommenen
        // Rabatte — sonst würde eine Nachbestellung sie ein zweites Mal berechnen.
        defaultValues: mode === "extension"
            ? { ...defaultValues, flatrates: [], discounts: [] }
            : defaultValues,
        validators: {
            onMount: createOfferSchema,
            onChange: createOfferSchema,
        },
        onSubmit: async ({ value }) => {
            if (mode === "renewal") {
                await renewOffer({ offerId: offer.id, input: value });
            } else {
                await extendOffer({ offerId: offer.id, input: toExtendInput(offer, value) });
            }
            closeFn();
        },
    });

    return { form };
}

export type DerivedFormApi = ReturnType<typeof useDerivedForm>["form"];
