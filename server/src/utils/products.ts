import {prisma} from "../lib/prismaClient.js";

interface PriceCalculatorProps {
    productId: string;
    contractId: string;
    duration: number;
    quantity: number;
    customerId?: string;
}

interface Tier {
    min_quantity: number;
    max_quantity: number | null;
    price: number;
}

function findMatchingTier<T extends Tier>(tiers: T[], quantity: number): T | undefined {
    return tiers.find((tier) => {
        const withinMin = quantity >= tier.min_quantity;
        const noUpperLimit = tier.max_quantity === null || tier.max_quantity === 0;
        const withinMax = noUpperLimit || quantity <= tier.max_quantity!;
        return withinMin && withinMax;
    });
}

export default async function calculatePrice(props: PriceCalculatorProps): Promise<number> {
    const {productId, contractId, duration, quantity, customerId} = props;

    const tariff = await prisma.tariff.findFirst({
        where: {productId, contractId},
        include: {
            rows: {
                orderBy: {order: "asc"},
                include: {
                    cells: {
                        orderBy: {order: "asc"},
                        include: {customerPrices: true},
                    },
                },
            },
        },
    });

    if (!tariff) return 0;

    // Term-Index finden
    const termIndex = tariff.terms.indexOf(duration);
    if (termIndex === -1) return 0;

    // Passende Zeile (Mengenstaffel) finden
    const row = tariff.rows.find(r => quantity >= r.min_quantity && quantity <= r.max_quantity);
    if (!row) return 0;

    const cell = row.cells[termIndex];
    if (!cell) return 0;

    // Customer-Override prüfen
    let price = cell.price;
    if (customerId) {
        const override = cell.customerPrices.find(cp => cp.customerId === customerId);
        if (override) price = override.price;
    }

    return price * quantity * duration;
}
