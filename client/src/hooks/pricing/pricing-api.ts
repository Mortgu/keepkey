import type { LivePriceQuery, PositionPrice } from "@keepit/schemas";
import { api } from "@/lib/api-client";

/**
 * Einzige Stelle, an der die Feldnamen der Angebotsposition auf die
 * abweichenden Query-Parameter des Preis-Endpunkts abgebildet werden.
 */
const toQuery = (query: LivePriceQuery) =>
    new URLSearchParams({
        customerId: query.customerId,
        productId: query.productId,
        contractId: query.contractId,
        duration: String(query.duration),
        quantity: String(query.quantity),
        free_months: String(query.free_months),
    });

/** Preis aus dem aktuell gültigen Tarif. */
export const getLivePrice = (query: LivePriceQuery) =>
    api<PositionPrice>(`/api/pricing/price/live?${toQuery(query)}`, { method: "GET" });

/**
 * Preis aus der Tarif-Version, die die Quellposition angepinnt hat. Weil dort
 * die vollständige Preistabelle eingefroren ist, greift auch bei geänderter
 * Menge die richtige Staffel.
 */
export const getPinnedPrice = (customerId: string, positionId: string, duration: number, quantity: number, free_months: number) =>
    api<PositionPrice>(
        `/api/pricing/price/pinned?customerId=${customerId}&positionId=${positionId}&duration=${duration}&quantity=${quantity}&free_months=${free_months}`,
        { method: "GET" },
    );

/** Schreibt einen kundenspezifischen Stückpreis und gibt den neuen Preis zurück. */
export const upsertCustomerPrice = (query: LivePriceQuery, unitPriceCents: number) =>
    api<PositionPrice>("/api/pricing/override", {
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
    return api<PositionPrice>(`/api/pricing/override?${params}`, { method: "DELETE" });
};
