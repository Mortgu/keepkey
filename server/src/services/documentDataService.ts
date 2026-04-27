import { prisma } from "../lib/prisma.js";
import { formatDate, formatDuration, formatEur } from "../utils/utils.js";
import { TemplateOfferData, TemplateProductData } from "../utils/generation/types.js";

export async function getOfferTemplateData(offerId: string) {
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

    const products = offerPositions.map(position => ({
        contract: position.contract,
        ...position.product,

        duration_months: position.duration_months,
        duration: formatDuration(position.duration_months),
    }));

    const groups = Object.groupBy(offerPositions, p => `${p.contract.id}_${p.duration_months}`);
    const grouped = Object.values(groups).map((group) => {
        const first = group![0];
        const group_total = group?.reduce((sum, p) => sum + p.total_cents, 0);

        return {
            names: group?.map(p => p.product.name).join(" & "),
            contract: first.contract,
            duration_months: first.duration_months,
            duration: formatDuration(first.duration_months),
            total: formatEur(group_total! / 100),
            items: group?.map((item) => ({
                name: item.product.name,
                description: item.product.description,

                quantity: item.quantity,
                optional: item.optional,

                price: {
                    total: formatEur(item.total_cents / 100),
                    unit: formatEur(item.total_cents / item.quantity / item.duration_months / 100),
                }
            }))
        }
    })

    return {
        voucherId: offer.voucherId,
        date: formatDate(offer.date),
        paymentTerm: offer.paymentTerm,
        validUntil: offer.validUntil ? formatDate(offer.validUntil) : "",
        requestFrom: offer.requestFrom ? formatDate(offer.requestFrom) : "",
        supplierId: offer.supplierId.slice(0, 8),

        customer: {
            id: customer.customerId || '',
            companyName: customer.companyName || '',
            street: customer.street || '',
            plz: customer.plz || '',
            city: customer.city || '',

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

        products: {
            names: offerPositions.map(p => p.product.name).join(' & '),
            grouped: grouped,
            items: [...products]
        }
    };
}
