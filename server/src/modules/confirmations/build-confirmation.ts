import { prisma } from "@/core/prisma.js";
import { getOrderById } from "@/modules/orders/order.service.js";
import { formatDate, formatEur } from "@/core/format.js";
import { confirmationTemplateSchema } from "./confirmation.template.schema.js";
import { formatOrderData } from "@/modules/orders/pipeline/actions.js";
import type { Language } from "@prisma/client";

/**
 * Alles, was die Vorlage der Auftragsbestätigung braucht — in einer Funktion,
 * von oben nach unten lesbar: Order laden, wie die Bestellung formatieren,
 * AB-Nummer und Steuerblock ergänzen, Namen bilden.
 *
 * Der Steuerblock steht an der AB selbst (beim Anlegen festgelegt) — die AB
 * zeigt auch später noch dieselben Zahlen, egal was sich am Kunden ändert.
 */
export async function buildConfirmation(confirmationId: string): Promise<{
    data: Record<string, unknown>;
    language: Language;
    displayName: string;
}> {
    const confirmation = await prisma.confirmation.findUniqueOrThrow({ where: { id: confirmationId } });
    const order = await getOrderById(confirmation.orderId);

    const base = await formatOrderData({ order });
    // Steuerblock aus der Row — beim Anlegen festgelegt, Regenerieren rechnet nie neu.
    const totals = {
        netCents: confirmation.net_cents,
        vatRate: confirmation.taxRate,
        vatCents: confirmation.vat_cents,
        grossCents: confirmation.gross_cents,
    };

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
