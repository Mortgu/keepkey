type PricingTier = {
    min_quantity: number;
    max_quantity: number | null;
    price: number;
};

export type PriceBreakdownItem = {
    from: number;
    to: number | null;
    pricePerUnit: number;
    quantity: number;
    subtotal: number;
};

export type PriceCalculationResult = {
    totalPrice: number;
    priceBreakdown: PriceBreakdownItem[];
};

export function calculatePrice(tiers: PricingTier[], quantity: number): PriceCalculationResult {
    const sorted = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);

    let remaining = quantity;
    let totalPrice = 0;
    const priceBreakdown: PriceBreakdownItem[] = [];

    for (let i = 0; i < sorted.length; i++) {
        if (remaining <= 0) break;

        const tier = sorted[i];
        const isLastTier = i === sorted.length - 1;
        const tierMax = isLastTier || !tier.max_quantity ? Infinity : tier.max_quantity;
        const tierCapacity = tierMax - tier.min_quantity + 1;
        const applied = Math.min(remaining, tierCapacity);
        const subtotal = applied * tier.price;

        totalPrice += subtotal;
        priceBreakdown.push({
            from: tier.min_quantity,
            to: tier.max_quantity === 0 ? null : tier.max_quantity,
            pricePerUnit: tier.price,
            quantity: applied,
            subtotal,
        });

        remaining -= applied;
    }

    return { totalPrice, priceBreakdown };
}
