import type { Language } from "@prisma/client";
import { getOrderById } from "../../services/order.service.js";
import { orderTemplateSchema } from "../../schemas/templates/order.template.schema.js";
import { translateFields } from "../../utils/i18n.js";
import { formatParty } from "../../utils/party.js";
import { formatDate, formatDuration, formatEur } from "../../utils/utils.js";

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
            total: formatEur(group_total / 100),
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
                    unit: formatEur(item.eur_user_month / 100),
                    gross: formatEur((item.total_cents + item.discount_cents) / 100),
                    discount: item.discount_cents ? formatEur(-item.discount_cents / 100) : "",
                    total: formatEur(item.total_cents / 100),
                },
            })),
        };
    });

    const orderFlatRates = flatRates.map((fr) => ({
        ...fr,
        price: {
            total: formatEur(fr.total_cents / 100),
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
        total: formatEur(order.net_amount / 100),
        discounts: order.discounts.map(d => ({ ...d, total: formatEur(-d.amount_cents / 100) })),
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
 * durch die Einkaufswerte ersetzt. Nur hier — `formatOrderData` selbst bleibt
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
        total: formatEur(order.purchase_net_amount / 100),
        items: group.items.map((item) => {
            const purchase = byId.get(item.offerPositionId);
            if (!purchase) return item;
            const net = purchase.purchase_total_cents - purchase.purchase_discount_cents;
            return {
                ...item,
                price: {
                    unit: formatEur(purchase.purchase_eur_user_month / 100),
                    gross: formatEur(purchase.purchase_total_cents / 100),
                    discount: purchase.purchase_discount_cents ? formatEur(-purchase.purchase_discount_cents / 100) : "",
                    total: formatEur(net / 100),
                },
            };
        }),
    }));

    return {
        ...formatted,
        groups,
        tables: groups,
        total: formatEur(order.purchase_net_amount / 100),
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

    const company = order.customer.companyName.replaceAll(" ", "").trim();
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
