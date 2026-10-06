import { vatTotals } from "@keepit/schemas";
import { prisma } from "../../lib/prismaClient.js";
import { getOrderById } from "../../services/order.service.js";
import { formatDate, formatEur } from "../../utils/utils.js";
import { confirmationTemplateSchema } from "../../schemas/templates/confirmation.template.schema.js";
import { formatOrderData } from "../order/actions.js";
import type { Language } from "@prisma/client";

/**
 * Alles, was die Vorlage der Auftragsbestätigung braucht — in einer Funktion,
 * von oben nach unten lesbar: Order laden, wie die Bestellung formatieren,
 * AB-Nummer und Steuerblock ergänzen, Namen bilden.
 *
 * Der Steuersatz kommt aus dem Accepted-Snapshot (`customer.taxRate`), nicht
 * aus dem aktuellen Kundendatensatz — die AB soll auch später noch dieselben
 * Zahlen zeigen wie am Tag der Annahme.
 */
export async function buildConfirmation(confirmationId: string): Promise<{
    data: Record<string, unknown>;
    language: Language;
    displayName: string;
}> {
    const confirmation = await prisma.confirmation.findUniqueOrThrow({ where: { id: confirmationId } });
    const order = await getOrderById(confirmation.orderId);

    const base = await formatOrderData({ order });
    const totals = vatTotals(order.net_amount, order.customer.taxRate);

    const data = confirmationTemplateSchema.parse({
        ...base,
        confirmationId: confirmation.confirmationId,
        confirmationDate: formatDate(confirmation.date) ?? "",
        netTotal: formatEur(totals.netCents / 100),
        vatRate: `${totals.vatRate.toLocaleString("de-DE", { minimumFractionDigits: 2 })} %`,
        vatAmount: formatEur(totals.vatCents / 100),
        grossTotal: formatEur(totals.grossCents / 100),
    });

    const company = order.customer.companyName.replaceAll(" ", "").trim();
    return {
        data,
        language: order.language,
        displayName: `${confirmation.confirmationId}_AB_${company}`,
    };
}
