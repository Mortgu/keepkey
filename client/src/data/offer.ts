import type { OfferProductInput } from "@/routes/admin/_adminLayout/offers/-components/offer-product-form";
import type { BaseOffer, Offer } from "./types";

export const getOffersAction = async () => {
    const response = await fetch('http://localhost:3000/api/offers', {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        return []
    }

    return await response.json();
}

export const createOfferAction = async (offer: BaseOffer, positions: OfferProductInput[]) => {
    const response = await fetch('http://localhost:3000/api/offers', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            offer: offer, positions: positions
        })
    });

    if (!response.ok) {
        throw new Error("Failed to create offer!");
    }

    return await response.json();
}