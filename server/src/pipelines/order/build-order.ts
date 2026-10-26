import type { Language } from "@prisma/client";
import { getOrderById } from "../../services/order.service.js";
import { orderTemplateSchema } from "../../schemas/templates/order.template.schema.js";
import { translateFields } from "../../utils/i18n.js";
import { formatParty } from "../../utils/party.js";
import { sanitizeCompanyName } from "../../utils/documents.js";
import { formatCentsToEur, formatDate, formatDuration } from "../../utils/utils.js";

export type OrderFetchedData = Awaited<ReturnType<typeof fetchOrderData>>;
export type OrderFormattedData = Awaited<ReturnType<typeof formatOrderData>>;

export async function fetchOrderData(orderId: string) {
    return { order: await getOrderById(orderId) };
}

export async function formatOrderData(fetchedData?: OrderFetchedData) {
    if (!fetchedData) {
        throw new Error("Failed to format order data! No input fetched data.");
    }

    const order = fetchedData.order;
    // Sprache und Konditionen stammen aus dem angenommenen Angebot.
    const lang = order.language;
    const { customer, customerContactPerson: ccp, employee } = order;

    // Resolve the language variant once and flatten it onto each entity so the
    // docx template can keep referencing name/description/table/features directly.
    // Vertrag und Laufzeit gelten fuer die ganze Bestellung. Sie werden einmal
    // aufgeloest und an jede Position gehaengt, damit das Template weiterhin
    // `position.contract` und `position.duration_months` lesen kann.
    const contract = {
        ...order.contract,
        ...translateFields(order.contract.translations, lang, { name: "", features: [] as string[], table: "" }),
    };
    const duration_months = order.duration_months;

    const orderPositions = order.orderPositions.map((position) => {
        const pt = translateFields(position.product.translations, lang, { name: "", description: "", table: "" });
        return {
            ...position,
            duration_months,
            contract,
            product: { ...position.product, ...pt },
        };
    });
    const flatRates = order.flatRates.map((fr) => {
        const ft = translateFields(fr.flatRate.translations, lang, { name: "", table: "" });
        return { ...fr, flatRate: { ...fr.flatRate, ...ft } };
    });

    const products = orderPositions.map((position) => ({
        contract,
        ...position.product,

        duration_months,
        duration: formatDuration(duration_months),
    }));

    // Frueher nach `contract_duration` gruppiert — beides steht jetzt an der
    // Bestellung, es gibt also genau eine Gruppe.
    const grouped = [orderPositions].map((group) => {
        const group_total = order.net_amount;

        return {
            names: group.map((p) => p.product.name).join(" & "),
            contract,
            duration_months,
            duration: formatDuration(duration_months),
            total: formatCentsToEur(group_total),
            // `item.total_cents` ist bereits netto (Freimonate abgezogen, siehe
            // presentOrder); `discount_cents` ist der abgezogene Betrag.
            items: group.map((item) => ({
                offerPositionId: item.id,
                name: item.product.name,
                description: item.product.description,
                table: item.product.table,
                quantity: item.quantity,
                optional: item.optional,
                free_months: item.free_months,
                contract,
                duration_months,
                price: {
                    unit: formatCentsToEur(item.eur_user_month),
                    gross: formatCentsToEur(item.total_cents + item.discount_cents),
                    discount: item.discount_cents ? formatCentsToEur(-item.discount_cents) : "",
                    total: formatCentsToEur(item.total_cents),
                },
            })),
        };
    });

    const orderFlatRates = flatRates.map((fr) => ({
        ...fr,
        price: {
            total: formatCentsToEur(fr.total_cents),
        },
    }));

    return {
        quoteId: order.orderId,
        orderId: order.orderId,
        projectNumber: order.projectNumber ?? "",
        projectId: order.projectNumber ?? "",
        offerId: order.offer.quoteId,
        projectDescription: order.projectDescription ?? "",
        orderDetails: order.orderDetails ?? "",
        products, groups: grouped, tables: grouped,
        flatRates: orderFlatRates, flatrates: orderFlatRates,
        total: formatCentsToEur(order.net_amount),
        discounts: order.discounts.map(d => ({ ...d, total: formatCentsToEur(-d.amount_cents) })),
        date: formatDate(order.date),
        paymentTerm: order.paymentTerm,
        validUntil: order.validUntil ? formatDate(order.validUntil) : "",
        requestFrom: order.requestFrom ? formatDate(order.requestFrom) : "",
        contractStartDate: order.contractStartDate ? formatDate(order.contractStartDate) : "",
        supplierId: order.supplierId || "",

        customer: {
            id: customer.customerId || "",
            companyName: customer.companyName || "",
            street: customer.street || "",
            zip: customer.zip || "",
            city: customer.city || "",

            ...formatParty({ salutation: ccp.salutation, firstName: ccp.firstName, lastName: ccp.lastName, phone: customer.phone, email: customer.email }),
        },

        employee: formatParty({
            salutation: employee.salutation,
            firstName: employee.firstName,
            lastName: employee.lastName,
            phone: employee.phone,
            email: employee.email,
        }),
    };
}

/**
 * Die Bestellung geht an den Zulieferer: Positionspreise und Summe werden
 * durch die Einkaufswerte ersetzt. Freimonate gibt es dort nicht — der
 * Gesamtbetrag ist, was wir zahlen; der Einzelpreis ist daraus gerundet. Nur hier — `formatOrderData` selbst bleibt
 * auf Verkaufspreisen, weil Auftragsbestätigung und Rechnung darauf aufbauen.
 * Pauschalen und Rabatte haben keinen Einkaufspreis und bleiben, wie sie sind.
 */
export function withPurchasePrices(
    formatted: OrderFormattedData,
    order: OrderFetchedData["order"],
): OrderFormattedData & { customerTotal: string; duration: string } {
    const byId = new Map(order.supplierPositions.map((p) => [p.offerPositionId, p]));
    const duration = order.duration_months;

    const groups = formatted.groups.map((group) => ({
        ...group,
        total: formatCentsToEur(order.purchase_net_amount),
        items: group.items.map((item) => {
            const purchase = byId.get(item.offerPositionId);
            if (!purchase) return item;
            const total = formatCentsToEur(purchase.purchase_total_cents);
            return {
                ...item,
                price: {
                    unit: formatCentsToEur(purchase.purchase_eur_user_month),
                    gross: total,
                    discount: "",
                    total,
                },
            };
        }),
    }));

    return {
        ...formatted,
        groups,
        tables: groups,
        total: formatCentsToEur(order.purchase_net_amount),
        // Zum Abgleich für Vorlagen, die beides zeigen wollen.
        customerTotal: formatted.total,
        duration: formatDuration(duration),
    };
}

/**
 * Alles, was die Bestellvorlage braucht — eine Funktion, von oben nach unten:
 * Bestellung laden, mit Verkaufspreisen formatieren, für den Zulieferer auf
 * Einkaufspreise umstellen, Namen bilden.
 *
 * `version` kommt vom `OrderDocument` und steht immer im Dateinamen.
 */
export async function buildOrder(orderId: string, version: number): Promise<{
    data: Record<string, unknown>;
    language: Language;
    displayName: string;
}> {
    const fetched = await fetchOrderData(orderId);
    const { order } = fetched;

    // Verkaufspreise formatieren, dann für den Zulieferer auf Einkauf umstellen.
    const data = withPurchasePrices(await formatOrderData(fetched), order);
    orderTemplateSchema.parse(data);

    const company = sanitizeCompanyName(order.customer.companyName);
    const workloads = order.orderPositions
        .map((p) => translateFields(p.product.translations, "DE", { name: "" }).name.replaceAll(" ", ""))
        .join("+");

    return {
        data,
        // Die Sprache steckt am Kunden, nicht an der Bestellung — hier liegt beides zusammen vor.
        language: order.language,
        displayName: `${order.orderId}_BE_${company}_Keepit-${workloads}_v${version}`,
    };
}
