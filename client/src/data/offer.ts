import type { OfferProductInput } from "@/routes/_main/offers/-components/offer-product-form";
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
        const error = await response.json();
        throw new Error(error.message);
    }

    return await response.json();
}

export const deleteOfferAction = async (id: string) => {
    const response = await fetch('http://localhost:3000/api/offers', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    });

    if (!response.ok) {
        throw new Error("Failed to delete offer!");
    }

    return await response.json();
}