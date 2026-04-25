import { prisma } from "../lib/prisma.js";
import { formatDate, formatEur } from "../utils/utils.js";
import { TemplateOfferData, TemplateProductData } from "../utils/generation/types.js";

export async function getOfferTemplateData(offerId: string): Promise<TemplateOfferData> {
    const [offer, contracts] = await Promise.all([
        await prisma.offer.findUniqueOrThrow({
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
        }),

        await prisma.contract.findMany(),
    ]);

    const { customer, customerContactPerson: ccp, user: employee, offerPositions } = offer;

    const includesOptionals = offerPositions.some(op => op.optional);
    const products = offerPositions.map((pos, index): TemplateProductData => {
        const pricePerUnit = pos.price_at_purchase / pos.quantity;
        const price_1 = pos.quantity * pricePerUnit;
        const price_12 = `${price_1 * 12} €`; // 1. Jahr
        const price_24 = `${price_1 * 24} €`; // 2. Jahre
        const price_36 = `${price_1 * 36} €`; // 3. Jahre

        return {
            name: pos.product.name || '{product.name}',
            description: pos.product.description || '{product.description}',
            duration: String(pos.duration) || '{product.duration}',
            quantity: String(pos.quantity) || '{product.quantity}',
            contract: {
                name: pos.contract.name || '{product.contract.name}',
                features: pos.contract.features || ["NaN"],
            },
            pricePerUnit: formatEur(pricePerUnit),
            totalPrice: formatEur(pos.price_at_purchase),
            optional: pos.optional || false,

            prices: {
                price_1: `${price_1} €`,
                price_12: price_12,
                price_24: price_24,
                price_36: price_36,
            }
        };
    });
    const groupedProducts = Object.groupBy(offerPositions, p => `${p.contract.name}_${p.duration}`);
    const positions = Object.values(groupedProducts).map(group => {
        const first = group![0];
        return {
            contract: {
                name: first.contract.name,
                features: first.contract.features,
            },
            duration: String(first.duration),
            products: group!.map(p => p.product.name).join(' & '),
        };
    });

    if (includesOptionals) {
        const extraPositions = positions.flatMap(pos =>
            contracts
                .filter(contract => contract.name !== pos.contract.name)
                .map(contract => ({
                    contract: { name: contract.name, features: contract.features },
                    duration: pos.duration,
                    products: pos.products,
                }))
        );
        positions.push(...extraPositions);
    }

    return {
        voucherId: offer.voucherId,
        date: formatDate(offer.date),
        paymentTerm: offer.paymentTerm,
        validUntil: offer.validUntil ? formatDate(offer.validUntil) : "",
        requestFrom: offer.requestFrom ? formatDate(offer.requestFrom) : "",
        supplierId: offer.supplierId.slice(0, 8),

        customer: {
            id: customer.customerId || '{customer.id}',
            companyName: customer.companyName || '{customer.companyName}',
            street: customer.street || '{customer.street}',
            plz: customer.plz || '{customer.plz}',
            city: customer.city || '{customer.city}',

            fullName: `${ccp.salutation} ${ccp.firstName} ${ccp.lastName}`,
            salutation: ccp.salutation || '{customer.salutation}',
            firstName: ccp.firstName || '{customer.firstName}',
            lastName: ccp.lastName || '{customer.lastName}',
            phone: customer.phone || '{customer.phone}',
            email: customer.email || '{customer.email}',
        },

        employee: {
            fullName: `${employee.salutation} ${employee.firstName} ${employee.lastName}`,
            salutation: employee.salutation || '{employee.salutation}',
            firstName: employee.firstName || '{employee.firstName}',
            lastName: employee.lastName || '{employee.lastName}',
            phone: employee.phone || '{employee.phone}',
            email: employee.email || '{employee.email}',
        },

        /* Used for the tables */
        products: products,

        /* Used for the first page */
        positions: {
            includesOptionals: includesOptionals,
            products: positions
        }
    };
}
