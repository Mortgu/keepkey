import { prisma } from "../lib/prisma.js";

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

export default async function calculatePrice(
  props: PriceCalculatorProps,
): Promise<number> {
  const { productId, contractId, duration, quantity, customerId } = props;

  if (customerId) {
    const customerTiers = await prisma.tariffCustomer.findMany({
      where: { productId, contractId, duration, customerId },
    });
    const tier = findMatchingTier(customerTiers, quantity);
    if (tier) return tier.price * quantity * duration;
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      tariff: {
        select: {
          configs: { where: { contractId, duration } },
        },
      },
    },
  });
  const configs = product?.tariff?.configs ?? [];
  const tier = findMatchingTier(configs, quantity);
  return tier ? tier.price * quantity * duration : 0;
}
