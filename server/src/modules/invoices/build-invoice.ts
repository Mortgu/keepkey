import type { Language } from "@prisma/client";
import { prisma } from "@/core/prisma.js";
import { invoiceContract } from "./invoice.template.schema.js";
import { getOrderById } from "@/modules/orders/order.service.js";
import { pickTranslation } from "@/core/i18n.js";
import { formatDate, formatDuration, formatEur } from "@/core/format.js";

/** "30 Tage" / "14 days" → 30 / 14; sonst null. */
export function paymentTermDays(paymentTerm: string): number | null {
    const match = /(\d+)/.exec(paymentTerm);
    return match ? Number(match[1]) : null;
}

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000);
const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

/**
 * Alles, was die Rechnungsvorlage braucht — eine Funktion, von oben nach unten:
 * Rechnung + Bestellung laden, Positionen als Rechnungszeilen, Steuerblock,
 * Name bilden. Datenvertrag ist `invoiceContract`.
 *
 * Preise: `presentOrder` liefert `total_cents` je Position bereits netto
 * (Freimonate abgezogen) und `discount_cents` als den abgezogenen Betrag.
 * Einzelpreis ist `eur_user_month`. Die Zeilensumme entspricht damit exakt
 * `net_amount` des angenommenen Angebots, das beim Anlegen als `net_cents`
 * gespeichert wurde.
 *
 * Rabatte erscheinen als eigene Zeilen mit negativem Betrag, damit die Summe
 * der Zeilen dem Nettobetrag entspricht.
 */
export async function buildInvoice(invoiceRowId: string): Promise<{
    data: Record<string, unknown>;
    language: Language;
    displayName: string;
}> {
    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceRowId } });
    const [order, confirmation] = await Promise.all([
        getOrderById(invoice.orderId),
        prisma.confirmation.findUnique({ where: { orderId: invoice.orderId }, select: { confirmationId: true } }),
    ]);
    const lang = order.language;
    const { customer, customerContactPerson: ccp, employee } = order;
    const eur = (cents: number) => formatEur(cents / 100);

    let pos = 0;
    const items = [
        ...order.orderPositions.map((p) => {
            const table = pickTranslation(p.product.translations, lang)?.table ?? "";

            return {
                pos: ++pos,
                description: table,
                quantity: p.quantity,
                unitPrice: eur(p.eur_user_month),
                gross: eur(p.total_cents + p.discount_cents),
                discount: p.discount_cents ? eur(-p.discount_cents) : "",
                total: eur(p.total_cents),
            };
        }),
        ...order.flatRates.map((fr) => ({
            pos: ++pos,
            description: pickTranslation(fr.flatRate.translations, lang)?.table ?? "",
            quantity: fr.quantity,
            unitPrice: eur(fr.quantity ? fr.total_cents / fr.quantity : 0),
            gross: eur(fr.total_cents),
            discount: "",
            total: eur(fr.total_cents),
        })),
        ...order.discounts.map((d) => ({
            pos: ++pos,
            description: d.title,
            quantity: 1,
            unitPrice: eur(-d.amount_cents),
            gross: eur(-d.amount_cents),
            discount: "",
            total: eur(-d.amount_cents),
        })),
    ];

    // Steuerblock aus der Row — beim Anlegen aus offer.net_amount festgelegt,
    // Regenerieren rechnet nie neu. Die Zeilen oben müssen dieselbe Summe ergeben
    // (Test), sonst stimmt die Darstellung nicht mit dem Beleg überein.
    const totals = {
        netCents: invoice.net_cents,
        vatRate: invoice.taxRate,
        vatCents: invoice.vat_cents,
        grossCents: invoice.gross_cents,
    };

    const days = paymentTermDays(order.paymentTerm);
    const start = order.contractStartDate ? new Date(order.contractStartDate) : null;

    const data = invoiceContract.parse({
        invoiceNumber: invoice.invoiceId,
        date: formatDate(invoice.date) ?? "",
        paymentTerm: order.paymentTerm,
        dueDate: days === null ? "" : formatDate(addDays(invoice.date, days)) ?? "",
        projectNumber: order.projectNumber ?? "",
        customerNumber: customer.customerId ?? "",
        supplierNumber: order.supplierId ?? "",
        orderNumber: order.orderId,
        confirmationNumber: confirmation?.confirmationId ?? "",
        servicePeriodFrom: start ? formatDate(start) ?? "" : "",
        servicePeriodTo: start ? formatDate(addDays(addMonths(start, order.duration_months), -1)) ?? "" : "",
        durationMonths: order.duration_months,
        duration: formatDuration(order.duration_months),

        customer: {
            id: customer.customerId,
            companyName: customer.companyName,
            firstName: ccp.firstName,
            lastName: ccp.lastName,
            salutation: ccp.salutation ?? "",
            fullName: `${ccp.salutation ?? ""} ${ccp.firstName} ${ccp.lastName}`.trim(),
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
