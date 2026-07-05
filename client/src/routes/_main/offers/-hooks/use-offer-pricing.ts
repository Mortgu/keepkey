import { getTariffPrice, upsertCustomerPrice } from "@/hooks/tariffs/tariff-api";
import { useMutation } from "@tanstack/react-query";
import type { OfferProductInput } from "../-components/modal-components/offer-product-form";

export default function useOfferPricing(customerId: string) {
    const { mutateAsync: fetchPrice } = useMutation({
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
    });

    const resolvePrice = async (data: OfferProductInput): Promise<OfferProductInput> => {
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
        data: OfferProductInput,
        unitPriceCents: number,
    ): Promise<number> => {
        const result = await persistOverride({
            productId: data.productId,
            contractId: data.contractId,
            duration: data.duration_months,
            quantity: data.quantity,
            customerId,
            price: unitPriceCents,
            optional: data.optional ?? false,
        });
        return result.price;
    };

    return { resolvePrice, persistCustomerOverride, fetchPrice };
}