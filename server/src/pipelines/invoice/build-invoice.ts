import { vatTotals } from "@keepit/schemas";
import type { Language } from "@prisma/client";
import { prisma } from "../../lib/prismaClient.js";
import { calculateNetAmount } from "../../services/offer/offer-pricing.js";
import { getOrderById } from "../../services/order.service.js";
import { invoiceContract } from "../../schemas/templates/invoice.template.schema.js";
import { pickTranslation } from "../../utils/i18n.js";
import { formatDate, formatDuration, formatEur } from "../../utils/utils.js";

/**
 * Alles, was die Rechnungsvorlage braucht — eine Funktion, von oben nach unten:
 * Rechnung + Bestellung laden, Positionen als Rechnungszeilen, Steuerblock,
 * Name bilden. Datenvertrag ist `invoiceContract`.
 *
 * Rabatte erscheinen als eigene Zeilen mit negativem Betrag, damit die Summe
 * der Zeilen dem Nettobetrag der Bestellung entspricht.
 */
export async function buildInvoice(invoiceRowId: string): Promise<{
    data: Record<string, unknown>;
    language: Language;
    displayName: string;
}> {
    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceRowId } });
    const order = await getOrderById(invoice.orderId);
    const lang = order.language;
    const { customer, customerContactPerson: ccp, employee } = order;
    const eur = (cents: number) => formatEur(cents / 100);

    let pos = 0;
    const items = [
        ...order.orderPositions.map((p) => {
            const name = pickTranslation(p.product.translations, lang)?.name ?? "";
            const unitCents = p.quantity && order.duration_months
                ? p.total_cents / p.quantity / order.duration_months
                : 0;
            return {
                pos: ++pos,
                articleNumber: p.productId,
                description: `${name} — ${formatDuration(order.duration_months)}`,
                quantity: p.quantity,
                unitPrice: eur(unitCents),
                discount: p.discount_cents ? eur(p.discount_cents) : "",
                total: eur(p.total_cents - p.discount_cents),
            };
        }),
        ...order.flatRates.map((fr) => ({
            pos: ++pos,
            articleNumber: fr.flatRateId,
            description: pickTranslation(fr.flatRate.translations, lang)?.name ?? "",
            quantity: fr.quantity,
            unitPrice: eur(fr.quantity ? fr.total_cents / fr.quantity : 0),
            discount: "",
            total: eur(fr.total_cents),
        })),
        ...order.discounts.map((d) => ({
            pos: ++pos,
            articleNumber: "",
            description: d.title,
            quantity: 1,
            unitPrice: eur(-d.amount_cents),
            discount: "",
            total: eur(-d.amount_cents),
        })),
    ];

    // Aus den Zeilen gerechnet (dieselbe Formel wie `net_amount` beim Speichern),
    // damit Zeilensumme und Summenblock auf der Rechnung garantiert übereinstimmen.
    const netCents = calculateNetAmount(order.orderPositions, order.flatRates, order.discounts);
    const totals = vatTotals(netCents, customer.taxRate);

    const data = invoiceContract.parse({
        invoiceNumber: invoice.invoiceId,
        date: formatDate(invoice.date) ?? "",
        paymentTerm: order.paymentTerm,
        projectNumber: order.projectNumber ?? "",
        customerNumber: customer.customerId ?? "",
        supplierNumber: order.supplierId ?? "",
        orderNumber: order.orderId,

        customer: {
            id: customer.customerId,
            companyName: customer.companyName,
            firstName: ccp.firstName,
            lastName: ccp.lastName,
            salutation: ccp.salutation ?? "",
            phone: customer.phone,
            email: customer.invoiceEmail || customer.email,
            street: customer.street ?? "",
            zip: customer.zip ?? "",
            city: customer.city ?? "",
        },
        employee: {
            firstName: employee.firstName,
            lastName: employee.lastName,
            salutation: employee.salutation,
            phone: employee.phone,
            email: employee.email,
        },

        projectDescription: order.projectDescription ?? "",
        orderDetails: order.orderDetails ?? "",
        items,

        netTotal: eur(totals.netCents),
        vatRate: `${totals.vatRate.toLocaleString("de-DE", { minimumFractionDigits: 2 })} %`,
        vatAmount: eur(totals.vatCents),
        grossTotal: eur(totals.grossCents),
    });

    const company = customer.companyName.replaceAll(" ", "").trim();
    return {
        data,
        language: lang,
        displayName: `${invoice.invoiceId}_RE_${company}`,
    };
}
