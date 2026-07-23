import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateOfferPositionInput } from "@keepit/schemas";
import { productKeys } from "@/hooks/products/product-keys";
import { getTariffPrice, upsertCustomerPrice } from "@/hooks/tariffs/tariff-api";

export default function useOfferPricing(customerId: string) {
    const queryClient = useQueryClient();

    const { mutateAsync: fetchPrice, isPending, error } = useMutation({
        mutationKey: ["price"],
        mutationFn: (args: {
            productId: string;
            contractId: string;
            quantity: number;
            duration: number;
            customerId?: string;
            freeMonths?: number;
        }) => getTariffPrice(args.productId, args.contractId, args.duration, args.quantity, args.customerId, args.freeMonths),
    });

    const { mutateAsync: persistOverride } = useMutation({
        mutationKey: ["customer-price"],
        mutationFn: (args: {
            productId: string;
            contractId: string;
            duration: number;
            quantity: number;
            customerId: string;
            price: number;
            optional: boolean;
        }) => upsertCustomerPrice(args),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: productKeys.prices() }),
    });

    const resolvePrice = async (data: CreateOfferPositionInput): Promise<CreateOfferPositionInput> => {
        const fetched = await fetchPrice({
            productId: data.productId,
            contractId: data.contractId,
            quantity: data.quantity,
            duration: data.duration_months,
            customerId,
            freeMonths: data.free_months,
        });

        return { ...data, total_cents: fetched.price };
    };

    const persistCustomerOverride = async (
        data: CreateOfferPositionInput,
        unitPriceCents: number,
    ): Promise<number> => {
        const result = await persistOverride({
            productId: data.productId,
            contractId: data.contractId,
            duration: data.duration_months,
            quantity: data.quantity,
            customerId,
            price: unitPriceCents,
            optional: data.optional,
        });
        return result.price;
    };

    return {
        fetchPrice,
        isPending: isPending,
        error: error,

        resolvePrice,
        persistCustomerOverride
    };
}
