import type { PositionPrice, PriceCoordinates } from "@keepit/schemas";
import { api } from "@/lib/api-client";

/**
 * Einzige Stelle, an der die Feldnamen der Angebotsposition auf die
 * abweichenden Query-Parameter des Preis-Endpunkts abgebildet werden.
 */
const toQuery = (coordinates: PriceCoordinates) =>
    new URLSearchParams({
        productId: coordinates.productId,
        contractId: coordinates.contractId,
        duration: String(coordinates.duration_months),
        quantity: String(coordinates.quantity),
        customerId: coordinates.customerId,
        freeMonths: String(coordinates.free_months),
    });

/** Preis aus dem aktuell gültigen Tarif. */
export const getLivePrice = (coordinates: PriceCoordinates) =>
    api<PositionPrice>(`/api/tariffs/price?${toQuery(coordinates)}`, { method: "GET" });

/**
 * Preis aus der Tarif-Version, die die Quellposition angepinnt hat. Weil dort
 * die vollständige Preistabelle eingefroren ist, greift auch bei geänderter
 * Menge die richtige Staffel.
 */
export const getPinnedPrice = (offerId: string, positionId: string, quantity: number) =>
    api<PositionPrice>(
        `/api/offers/${offerId}/positions/${positionId}/extension-price?quantity=${quantity}`,
        { method: "GET" },
    );

/** Schreibt einen kundenspezifischen Stückpreis und gibt den neuen Preis zurück. */
export const upsertCustomerPrice = (coordinates: PriceCoordinates, unitPriceCents: number) =>
    api<PositionPrice>("/api/tariffs/customer-price", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            productId: coordinates.productId,
            contractId: coordinates.contractId,
            duration: coordinates.duration_months,
            quantity: coordinates.quantity,
            customerId: coordinates.customerId,
            price: unitPriceCents,
        }),
    });

/** Entfernt einen kundenspezifischen Stückpreis; der Tarifpreis gilt wieder. */
export const deleteCustomerPrice = (coordinates: PriceCoordinates) => {
    const params = new URLSearchParams({
        productId: coordinates.productId,
        contractId: coordinates.contractId,
        duration: String(coordinates.duration_months),
        quantity: String(coordinates.quantity),
        customerId: coordinates.customerId,
    });
    return api<PositionPrice>(`/api/tariffs/customer-price?${params}`, { method: "DELETE" });
};
