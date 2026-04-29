import { prisma } from "../lib/prisma.js";
import { formatEur } from "./utils.js";

interface PriceCalculatorProps {
    productId: string;
    contractId: string;
    duration_months: number;
    quantity: number;
}

export default async function calculatePrice(props: PriceCalculatorProps): Promise<number> {
    const { productId, contractId, duration_months, quantity } = props;

    const tiers = await prisma.productPricing.findMany({
        where: { productId, contractId, duration_months },
    });

    const matchingTier = tiers.find(tier => {
        const withinMin = quantity >= tier.min_quantity;
        const noUpperLimit = tier.max_quantity === null || tier.max_quantity === 0;
        const withinMax = noUpperLimit || quantity <= tier.max_quantity!;
        return withinMin && withinMax;
    });

    if (!matchingTier) {
        return 0;
    }

    const subtotal_month = quantity * matchingTier.price;

    return subtotal_month * duration_months;
}