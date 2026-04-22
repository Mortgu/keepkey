import { prisma } from "../lib/prisma.js";
import { formatDate } from "../utils/utils.js";
import { InvoiceTemplateData, OfferTemplateData, TemplateData_ProductPosition } from "../utils/generation/types.js";

function formatEur(value: number): string {
    return value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

const CONTRACT_FEATURES: Record<string, string[]> = {
    "Business Essentials": [
        "Datenaufbewahrung / max. Retention: 1 Jahr",
        "9*5 Support (Business Hours) über Chat & eMail",
    ],
    "Enterprise Unlimited": [
        "Datenaufbewahrung / max. Retention: unlimitiert (>99 Jahre)",
        "API-Unterstützung für Integration von Drittanbietern",
        "Individuelles RBAC (individuelle Anpassung von Rollen & Rechten)",
        "24*7 Support über Telefon, Chat & eMail",
        "Persönlicher Customer Success Manager",
    ],
};

function positionLabel(index: number): string {
    return `${String.fromCharCode(65 + index)})`;
}

export async function getOfferTemplateData(offerId: string): Promise<OfferTemplateData> {
    const offer = await prisma.offer.findUniqueOrThrow({
        where: { id: offerId },
        include: {
            customer: true,
            customerContactPerson: true,
            user: true,
            offerPositions: {
                include: {
                    product: true,
                    contract: true,
                }
            }
        }
    });

    const { customer, customerContactPerson, user } = offer;

    const hasOptionalPositions = offer.offerPositions.some(p => p.optional);

    const products = offer.offerPositions.map((pos, index): TemplateData_ProductPosition => {
        const pricePerUnit = pos.totalPrice / pos.quantity;

        return {
            name: pos.product.name || '{product.name}',
            description: pos.product.description || '{product.description}',
            duration: String(pos.duration) || '{product.duration}',
            quantity: String(pos.quantity) || '{product.quantity}',
            contract: {
                name: pos.contract.name || '{product.contract.name}',
                features: "{product.contract.features}",
            },
            pricePerUnit: formatEur(pricePerUnit),
            totalPrice: formatEur(pos.totalPrice),
            optional: pos.optional || false
        };
    });

    const allProducts = offer.offerPositions.map(i => i.product.name).join(" & ");
    const totalSum = offer.offerPositions.reduce((sum, p) => sum + p.totalPrice, 0);

    return {
        voucherId: offer.voucherId || '{voucherId}',
        date: formatDate(offer.date) || '{date}',
        paymentTerm: offer.paymentTerm || '{paymentTerm}',
        validUntil: formatDate(offer.validUntil) || '{validUntil}',
        requestFrom: formatDate(offer.requestFrom) || '{requestFrom}',
        supplierId: offer.supplierId.slice(0, 8) || '{supplierId}',

        customer: {
            id: customer.customerId || '{customer.id}',
            companyName: customer.companyName || '{customer.companyName}',
            street: customer.street || '{customer.street}',
            plz: customer.plz || '{customer.plz}',
            city: customer.city || '{customer.city}',

            salutation: customerContactPerson.salutation || '{customer.salutation}',
            firstName: customerContactPerson.firstName || '{customer.firstName}',
            lastName: customerContactPerson.lastName || '{customer.lastName}',
            phone: customer.phone || '{customer.phone}',
            email: customer.email || '{customer.email}',
        },

        employee: {
            salutation: user.salutation || '{employee.salutation}',
            firstName: user.firstName || '{employee.firstName}',
            lastName: user.lastName || '{employee.lastName}',
            phone: '',
            email: user.email || '{employee.email}',
        },

        products: {
            names: products.map(p => p.name).join(" & "),
            positions: products,
        }
    };
}

export async function getInvoiceTemplateData(orderId: string): Promise<OfferTemplateData> {
    const order = await prisma.order.findUniqueOrThrow({
        where: { id: orderId },
        include: {
            customer: true,
            user: true,
            orderPositions: {
                include: {
                    product: true,
                    contract: true,
                }
            }
        }
    });

    const { customer, user } = order;

    const contactPerson = await prisma.contactPerson.findFirst({
        where: { customerId: customer.id }
    });

    const products = order.orderPositions.map((pos, index) => {
        const lineTotal = pos.priceAtPurchase * pos.quantity;
        return {
            name: pos.product.name || '{product.name}',
            description: pos.product.description || '{product.description}',
            duration: String(pos.duration) || '{product.duration}',
            quantity: String(pos.quantity) || '{product.quantity}',
            contract: {
                name: pos.contract.name || '{product.contract.name}',
                features: "{product.contract.features}",
            },
            pricePerUnit: formatEur(lineTotal),
            totalPrice: formatEur(lineTotal),
            optional: false,
        };
    });

    const totalSum = order.orderPositions.reduce((sum, p) => sum + p.priceAtPurchase * p.quantity, 0);

    const contactFull = contactPerson
        ? `${contactPerson.salutation} ${contactPerson.firstName} ${contactPerson.lastName}`
        : "";

    return {
        voucherId: '{voucherId}',
        date: '{date}',
        paymentTerm: '{paymentTerm}',
        validUntil: '{validUntil}',
        requestFrom: '{requestFrom}',
        supplierId: '{supplierId}',

        customer: {
            id: customer.customerId || '{customer.id}',
            companyName: customer.companyName || '{customer.companyName}',
            street: customer.street || '{customer.street}',
            plz: customer.plz || '{customer.plz}',
            city: customer.city || '{customer.city}',

            salutation: '{customer.salutation}',
            firstName: '{customer.firstName}',
            lastName: '{customer.lastName}',
            phone: customer.phone || '{customer.phone}',
            email: customer.email || '{customer.email}',
        },

        employee: {
            salutation: user.salutation || '{employee.salutation}',
            firstName: user.firstName || '{employee.firstName}',
            lastName: user.lastName || '{employee.lastName}',
            phone: '',
            email: user.email || '{employee.email}',
        },

        products: {
            names: "",
            positions: products,
        }
    };
}
