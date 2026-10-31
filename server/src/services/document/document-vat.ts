import { vatTotals } from "@keepit/schemas";
import type { Prisma } from "@prisma/client";

/**
 * Steuerblock für einen Beleg (AB, Rechnung) zum Zeitpunkt des Anlegens.
 *
 * Netto ist `offer.net_amount` des angenommenen Angebots — authoritativ und
 * unveränderlich. Keine zweite Summenbildung aus Zeilen. Der Satz kommt aus
 * dem Formular, sonst vom Kunden (aktueller Stand, nicht der Snapshot). Die
 * Werte werden mit der Row gespeichert; Regenerieren rechnet nie neu.
 */
export async function vatForOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
    taxRate: number | undefined,
): Promise<{ taxRate: number; net_cents: number; vat_cents: number; gross_cents: number }> {
    const order = await tx.order.findUniqueOrThrow({
        where: { id: orderId },
        select: { offer: { select: { net_amount: true, customer: { select: { taxRate: true } } } } },
    });
    const rate = taxRate ?? order.offer.customer.taxRate;
    const totals = vatTotals(order.offer.net_amount, rate);
    return { taxRate: rate, net_cents: totals.netCents, vat_cents: totals.vatCents, gross_cents: totals.grossCents };
}
