import type { Language } from "@prisma/client";
import { prisma } from "@/lib/prismaClient.js";
import { invoiceContract } from "@/schemas/templates/invoice.template.schema.js";
import { getOrderById } from "@/services/order.service.js";
import { translateFields } from "@/utils/i18n.js";
import { formatParty } from "@/utils/party.js";
import { sanitizeCompanyName } from "@/utils/documents.js";
import { formatCentsToEur, formatDate, formatDuration, formatPercent } from "@/utils/utils.js";

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
 * Preise: `presentOrder` liefert `totalCents` je Position bereits netto
 * (Freimonate abgezogen) und `discountCents` als den abgezogenen Betrag.
 * Einzelpreis ist `unitCents`. Die Zeilensumme entspricht damit exakt
 * `netAmount` des angenommenen Angebots, das beim Anlegen als `netCents`
 * gespeichert wurde.
 *
 * Rabatte erscheinen als eigene Zeilen mit negativem Betrag, damit die Summe
 * der Zeilen dem Nettobetrag entspricht.
 */

type BuildInvoiceReturn = {
    data: Record<string, unknown>;
    language: Language;
    displayName: string;
};

export async function buildInvoice(invoiceRowId: string): Promise<BuildInvoiceReturn> {
    const invoice = await prisma.invoice.findUniqueOrThrow({
        where: { id: invoiceRowId } 
    });

    const [order, confirmation] = await Promise.all([
        getOrderById(invoice.orderId),
        prisma.confirmation.findUnique({ 
            where: { orderId: invoice.orderId }, 
            select: { confirmationId: true } 
        }),
    ]);
    
    const lang = order.language;
    const { customer, customerContactPerson: ccp, employee } = order;

    let pos = 0;
    const items = [
        ...order.orderPositions.map((p) => {
            const { table } = translateFields(p.product.translations, lang, { table: "" });

            return {
                pos: ++pos,
                description: table,
                quantity: p.quantity,
                unitPrice: formatCentsToEur(p.unitCents),
                gross: formatCentsToEur(p.totalCents + p.discountCents),
                discount: p.discountCents ? formatCentsToEur(-p.discountCents) : "",
                total: formatCentsToEur(p.totalCents),
            };
        }),
        ...order.flatRates.map((fr) => ({
            pos: ++pos,
            description: translateFields(fr.flatRate.translations, lang, { table: "" }).table,
            quantity: fr.quantity,
            unitPrice: formatCentsToEur(fr.quantity ? fr.totalCents / fr.quantity : 0),
            gross: formatCentsToEur(fr.totalCents),
            discount: "",
            total: formatCentsToEur(fr.totalCents),
        })),
        ...order.discounts.map((d) => ({
            pos: ++pos,
            description: d.title,
            quantity: 1,
            unitPrice: formatCentsToEur(-d.amount_cents),
            gross: formatCentsToEur(-d.amount_cents),
            discount: "",
            total: formatCentsToEur(-d.amount_cents),
        })),
    ];

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
            street: customer.street ?? "",
            zip: customer.zip ?? "",
            city: customer.city ?? "",
            ...formatParty({
                salutation: ccp.salutation,
                firstName: ccp.firstName,
                lastName: ccp.lastName,
                phone: customer.phone,
                email: customer.invoiceEmail || customer.email,
            }),
        },
        employee: formatParty({
            salutation: employee.salutation,
            firstName: employee.firstName,
            lastName: employee.lastName,
            phone: employee.phone,
            email: employee.email,
        }),

        projectDescription: order.projectDescription ?? "",
        orderDetails: order.orderDetails ?? "",
        items,

        // Steuerblock aus der Row — beim Anlegen aus offer.netAmount festgelegt,
        // Regenerieren rechnet nie neu. Die Zeilen oben müssen dieselbe Summe ergeben
        // (Test), sonst stimmt die Darstellung nicht mit dem Beleg überein.
        netTotal: formatCentsToEur(invoice.netCents),
        vatRate: formatPercent(invoice.taxRate),
        vatAmount: formatCentsToEur(invoice.vatCents),
        grossTotal: formatCentsToEur(invoice.grossCents),
    });

    return {
        data,
        language: lang,
        displayName: `${invoice.invoiceId}_RE_${sanitizeCompanyName(customer.companyName)}`,
    };
}
