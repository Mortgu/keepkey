import { useState } from "react";
import type { GetOfferFlatrate, Offer, OfferFlatRate, OfferPosition } from "@/types";
import type { OfferProductInput } from "../-components/modal-components/offer-product-form";
import useOfferPricing from "./use-offer-pricing";

const toOfferProductInput = (pos: OfferPosition): OfferProductInput => ({
    productId: pos.productId,
    contractId: pos.contractId,
    duration_months: pos.duration_months,
    free_months: pos.free_months ?? 0,
    quantity: pos.quantity,
    optional: pos.optional ?? false,
    total_cents: typeof pos.total_cents === "number" ? pos.total_cents : 0,
    eur_user_month: typeof pos.eur_user_month === "number" ? pos.eur_user_month : 0,
    discount_cents: typeof pos.discount_cents === "number" ? pos.discount_cents : 0,
});

const toOfferFlatRateInput = (fr: OfferFlatRate): GetOfferFlatrate => ({
    flatRateId: fr.flatRateId,
    flatRate: fr.flatRate,
    offerId: fr.offerId,
    quantity: fr.quantity,
    total_cents: typeof fr.total_cents === "number" ? fr.total_cents : 0,
});

export function useOfferProducts(currentOffer: Offer | undefined, customerId: string) {
    const [offerProducts, setOfferProducts] = useState<Array<OfferProductInput>>(
        currentOffer?.offerPositions.map(toOfferProductInput) ?? []);

    const [offerFlatRates, setOfferFlatRates] = useState<Array<GetOfferFlatrate>>(
        currentOffer?.offerFlatRates.map(toOfferFlatRateInput) ?? []);

    const { resolvePrice, persistCustomerOverride } = useOfferPricing(customerId);

    const addProduct = async (data: OfferProductInput) => {
        const priced = await resolvePrice(data);
        setOfferProducts((prev) => [...prev, priced]);
    };

    const updateProduct = async (index: number, data: OfferProductInput) => {
        const priced = await resolvePrice(data);
        setOfferProducts((prev) => prev.map((p, i) => (i === index ? priced : p)));
    };

    const removeProduct = (index: number) => {
        setOfferProducts((prev) => prev.filter((_, i) => i !== index));
    };

    const addFlatRate = (data: GetOfferFlatrate) => {
        setOfferFlatRates((prev) => [...prev, data]);
    };

    const removeFlatRate = (index: number) => {
        setOfferFlatRates((prev) => prev.filter((_, i) => i !== index));
    };

    return {
        offerProducts,
        addProduct,
        updateProduct,
        removeProduct,
        persistCustomerOverride,
        offerFlatRates,
        addFlatRate,
        removeFlatRate,
    };
}