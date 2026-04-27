import { prisma } from "../lib/prisma.js";
import { formatDate, formatDuration, formatEur } from "../utils/utils.js";
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
    const products = offerPositions.map((position, index): TemplateProductData => {
        const total_cents = position.total_cents;
        const cents_per_unit = total_cents / position.quantity;

        const total_eur = total_cents / 100;
        const eur_per_unit = cents_per_unit / 100;

        const month_eur = eur_per_unit * position.quantity;
        const year_1_eur = month_eur * 12;
        const year_2_eur = year_1_eur * 2;
        const year_3_eur = year_1_eur * 3;

        return {
            name: position.product.name || '{product.name}',
            description: position.product.description || '{product.description}',

            duration: formatDuration(position.duration_months),
            duration_months: position.duration_months,

            quantity: String(position.quantity) || '{product.quantity}',
            contract: {
                name: position.contract.name || '{product.contract.name}',
                features: position.contract.features || ["NaN"],
            },

            pricePerUnit: formatEur(eur_per_unit),
            totalPrice: formatEur(total_eur),
            optional: position.optional || false,

            prices: {
                price_1: formatEur(month_eur),
                price_12: formatEur(year_1_eur),
                price_24: formatEur(year_2_eur),
                price_36: formatEur(year_3_eur),
            }
        };
    });
    const groupedProducts = Object.groupBy(products, p => `${p.contract.name}_${p.duration_months}`);
    const positions = Object.values(groupedProducts).map(group => {
        const first = group![0];
        return {
            contract: {
                name: first.contract.name,
                features: first.contract.features,
            },
            duration_months: String(first.duration_months),
            duration: first.duration,
            names: group!.map(p => p.name).join(' & '),
            products: group
        };
    });


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
            salutation: ccp.salutation || '',
            firstName: ccp.firstName || '',
            lastName: ccp.lastName || '',
            phone: customer.phone || '',
            email: customer.email || '',
        },

        employee: {
            fullName: `${employee.salutation} ${employee.firstName} ${employee.lastName}`,
            salutation: employee.salutation || '',
            firstName: employee.firstName || '',
            lastName: employee.lastName || '',
            phone: employee.phone || '',
            email: employee.email || '',
        },

        /* Used for the tables */
        products: products,

        /* Used for the first page */
        positions: {
            names: products.map(p => p.name).join(' & '),
            includesOptionals: includesOptionals,
            products: positions
        }
    };
}
