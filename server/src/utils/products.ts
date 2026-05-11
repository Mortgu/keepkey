import { prisma } from "../lib/prisma.js";
import { ProductPricing } from "@prisma/client";

interface PriceCalculatorProps {
  productId: string;
  contractId: string;
  duration_months: number;
  quantity: number;
  customerId?: string;
}

function findMatchingTier(tiers: ProductPricing[], quantity: number) {
  return tiers.find((tier) => {
    const withinMin = quantity >= tier.min_quantity;
    const noUpperLimit = tier.max_quantity === null || tier.max_quantity === 0;
    const withinMax = noUpperLimit || quantity <= tier.max_quantity!;
    return withinMin && withinMax;
  });
}

export default async function calculatePrice(
  props: PriceCalculatorProps,
): Promise<number> {
  const { productId, contractId, duration_months, quantity, customerId } = props;

  // Pass 1: customer-specific override
  if (customerId) {
    const customerTiers = await prisma.productPricing.findMany({
      where: { productId, contractId, duration_months, customerId },
    });
    const tier = findMatchingTier(customerTiers, quantity);
    if (tier) return tier.price * quantity * duration_months;
  }

  // Pass 2: list price fallback
  const listTiers = await prisma.productPricing.findMany({
    where: { productId, contractId, duration_months, customerId: null },
  });
  const tier = findMatchingTier(listTiers, quantity);
  return tier ? tier.price * quantity * duration_months : 0;
}
