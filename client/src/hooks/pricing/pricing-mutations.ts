import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCustomerPrice, upsertCustomerPrice } from "./pricing-api";
import { pricingKeys } from "./pricing-keys";
import type { PriceCoordinates } from "@keepit/schemas";

/**
 * Kundenspezifischer Stückpreis für eine Tarif-Zelle.
 *
 * Nach jeder Änderung wird der gesamte Preis-Cache verworfen: ein Override gilt
 * für die Zelle, also für jede Menge in derselben Staffel — welche Abfragen
 * dadurch veraltet sind, lässt sich am Query-Key nicht ablesen.
 */
export function useCustomerPriceOverride() {
    const queryClient = useQueryClient();
    const invalidate = () => queryClient.invalidateQueries({ queryKey: pricingKeys.all });

    const { mutateAsync: setOverride, isPending: isSaving, error: saveError } = useMutation({
        mutationFn: (args: { coordinates: PriceCoordinates; unitPriceCents: number }) =>
            upsertCustomerPrice(args.coordinates, args.unitPriceCents),
        onSuccess: invalidate,
    });

    const { mutateAsync: clearOverride, isPending: isClearing, error: clearError } = useMutation({
        mutationFn: (coordinates: PriceCoordinates) => deleteCustomerPrice(coordinates),
        onSuccess: invalidate,
    });

    return {
        setOverride,
        clearOverride,
        isPending: isSaving || isClearing,
        error: saveError ?? clearError,
    };
}
