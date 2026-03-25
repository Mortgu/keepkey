export function calculateProductPrice(product, quantity, duration, contractId) {
    let total = 0;
    let remainingQuantity = Number(quantity);

    // Filter pricing by contract and sort by min_quantity
    const applicablePricing = product.productPricing
        .filter(pricing => !contractId || pricing.contractId === contractId || pricing.duration === duration)
        .sort((a, b) => a.min_quantity - b.min_quantity);

    // Calculate tiered pricing with breakdown
    const breakdown = [];
    for (const pricing of applicablePricing) {
        if (remainingQuantity <= 0) break;

        // If max_quantity is 0 or null, it's unlimited - use all remaining quantity
        const isUnlimited = pricing.max_quantity === 0 || pricing.max_quantity === null;
        const rangeSize = isUnlimited ? remainingQuantity : pricing.max_quantity - pricing.min_quantity + 1;
        const quantityInThisTier = Math.min(remainingQuantity, rangeSize);
        const subtotal = quantityInThisTier * pricing.price;

        breakdown.push({
            range: isUnlimited ? `${pricing.min_quantity}+` : `${pricing.min_quantity}-${pricing.max_quantity}`,
            minQuantity: pricing.min_quantity,
            maxQuantity: pricing.max_quantity || null,
            quantity: quantityInThisTier,
            pricePerUnit: pricing.price,
            subtotal: parseFloat(subtotal.toFixed(2))
        });

        total += subtotal;
        remainingQuantity -= quantityInThisTier;
    }

    return {
        quantity: Number(quantity),
        contractId,
        breakdown,
        total: parseFloat(total.toFixed(2))
    }
}