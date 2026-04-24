import { prisma } from "../lib/prisma.js";
import { formatEur } from "./utils.js";

interface PriceCalculatorProps {
    productId: string;
    contractId: string;
    duration: number;
    quantity: number;
};

type PriceCalculatorPriceProps = {
    value: number;
    label: string;
}

type PriceCalculatorResult = {
    unit: PriceCalculatorPriceProps;
    month: PriceCalculatorPriceProps;
    total: PriceCalculatorPriceProps;

    year_1: PriceCalculatorPriceProps;
    year_2: PriceCalculatorPriceProps;
    year_3: PriceCalculatorPriceProps;
}

export default async function calculatePrice(props: PriceCalculatorProps): Promise<PriceCalculatorResult | null> {
    const { productId, contractId, duration, quantity } = props;

    const tiers = await prisma.productPricing.findMany({
        where: { productId, contractId, duration },
    });

    const matchingTier = tiers.find(tier => {
        const withinMin = quantity >= tier.min_quantity;
        const noUpperLimit = tier.max_quantity === null || tier.max_quantity === 0;
        const withinMax = noUpperLimit || quantity <= tier.max_quantity!;
        return withinMin && withinMax;
    });

    if (!matchingTier) {
        return null;
    }

    const subtotal = quantity * matchingTier.price;

    const year_1 = Math.round(subtotal * 12);
    const year_2 = Math.round(subtotal * 24);
    const year_3 = Math.round(subtotal * 36);
    const total = subtotal * duration;

    return {
        unit: { value: matchingTier.price, label: formatEur(matchingTier.price) },
        month: { value: subtotal, label: formatEur(subtotal) },
        total: { value: total, label: formatEur(total) },

        year_1: { value: year_1, label: formatEur(year_1) },
        year_2: { value: year_2, label: formatEur(year_2) },
        year_3: { value: year_3, label: formatEur(year_3) },
    }
}