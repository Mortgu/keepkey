import {vatTotals} from "@keepit/schemas";
import type {Prisma} from "@prisma/client";

/**
 * Steuerblock für einen Beleg (AB, Rechnung) zum Zeitpunkt des Anlegens.
 *
 * Netto ist `offer.netAmount` des angenommenen Angebots — authoritativ und
 * unveränderlich. Keine zweite Summenbildung aus Zeilen. Der Satz kommt aus
 * dem Formular, sonst vom Kunden (aktueller Stand, nicht der Snapshot). Die
 * Werte werden mit der Row gespeichert; Regenerieren rechnet nie neu.
 */
type vatForOrderReturn = {
    taxRate: number;
    netCents: number;
    vatCents: number;
    grossCents: number;
};

export async function vatForOrder(transaction: Prisma.TransactionClient, orderId: string, taxRate: number | undefined): Promise<vatForOrderReturn> {
    const order = await transaction.order.findUniqueOrThrow({
        where: {id: orderId},
        select: {
            offer: {
                select: {
                    netAmount: true,
                    customer: {
                        select: {
                            taxRate: true
                        }
                    }
                }
            }
        },
    });

    const rate = taxRate ?? order.offer.customer.taxRate;
    const totals = vatTotals(order.offer.netAmount, rate);

    return {
        taxRate: rate,
        netCents: totals.netCents,
        vatCents: totals.vatCents,
        grossCents: totals.grossCents
    };
}
