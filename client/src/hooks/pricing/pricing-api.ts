import type { LivePriceQuery, PositionPrice } from "@keepit/schemas";
import { api } from "@/lib/api-client";

/**
 * Einzige Stelle, an der die Feldnamen der Angebotsposition auf die
 * abweichenden Query-Parameter des Preis-Endpunkts abgebildet werden.
 */
const toQuery = (query: LivePriceQuery) =>
    new URLSearchParams({
        productId: query.productId,
        contractId: query.contractId,
        duration: String(query.duration),
        quantity: String(query.quantity),
        customerId: query.customerId,
        free_months: String(query.free_months),
    });

/** Preis aus dem aktuell gültigen Tarif. */
export const getLivePrice = (query: LivePriceQuery) =>
    api<PositionPrice>(`/api/tariffs/price?${toQuery(query)}`, { method: "GET" });

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
export const upsertCustomerPrice = (query: LivePriceQuery, unitPriceCents: number) =>
    api<PositionPrice>("/api/tariffs/customer-price", {
        method: "PUT",
        body: JSON.stringify({
            productId: query.productId,
            contractId: query.contractId,
            duration: query.duration,
            quantity: query.quantity,
            customerId: query.customerId,
            price: unitPriceCents,
        }),
    });

/** Entfernt einen kundenspezifischen Stückpreis; der Tarifpreis gilt wieder. */
export const deleteCustomerPrice = (query: LivePriceQuery) => {
    const params = new URLSearchParams({
        productId: query.productId,
        contractId: query.contractId,
        duration: String(query.duration),
        quantity: String(query.quantity),
        customerId: query.customerId,
    });
    return api<PositionPrice>(`/api/tariffs/customer-price?${params}`, { method: "DELETE" });
};
