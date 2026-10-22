import { prisma } from "../../lib/prismaClient.js";
import { getOrderById } from "../../services/order.service.js";
import { sanitizeCompanyName } from "../../utils/documents.js";
import { formatCentsToEur, formatDate, formatPercent } from "../../utils/utils.js";
import { confirmationTemplateSchema } from "../../schemas/templates/confirmation.template.schema.js";
import { formatOrderData } from "../order/build-order.js";
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
    baseName: string;
}> {
    const confirmation = await prisma.confirmation.findUniqueOrThrow({ where: { id: confirmationId } });
    const order = await getOrderById(confirmation.orderId);

    const base = await formatOrderData({ order });

    const data = confirmationTemplateSchema.parse({
        ...base,
        confirmationId: confirmation.confirmationId,
        confirmationDate: formatDate(confirmation.date) ?? "",
        // Steuerblock aus der Row — beim Anlegen festgelegt, Regenerieren rechnet nie neu.
        netTotal: formatCentsToEur(confirmation.net_cents),
        vatRate: formatPercent(confirmation.taxRate),
        vatAmount: formatCentsToEur(confirmation.vat_cents),
        grossTotal: formatCentsToEur(confirmation.gross_cents),
    });

    return {
        data,
        language: order.language,
        baseName: `${confirmation.confirmationId}_AB_${sanitizeCompanyName(order.customer.companyName)}`,
    };
}
