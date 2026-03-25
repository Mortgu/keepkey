import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { canCreateProduct } from "../permissions/product.js";
import { requireSession } from "../middlewares/auth.js";

const router = Router();

/* [GET] http://localhost:3000/api/products */
router.get('/', async (request, response) => {
    const result = await prisma.product.findMany({
        include: {
            productPricing: {
                include: {
                    product: true,
                    contract: true
                }
            }
        }
    });
    response.status(200).send(result);
});

/* [GET] http://localhost:3000/api/products/{id}?quantity={quantity}&contract={contractId} */
router.get('/:id', async (request, response) => {
    const { id } = request.params;
    const { quantity, contract } = request.query;

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            productPricing: true
        }
    });

    if (!product) {
        return response.status(404).json({
            success: false, message: 'Product not found',
        });
    }

    let total = 0;
    let remainingQuantity = Number(quantity);

    // Filter pricing by contract and sort by min_quantity
    const applicablePricing = product.productPricing
        .filter(pricing => !contract || pricing.contractId === contract)
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

    const result = {
        success: true,
        ...product,
        calculatedPrice: {
            quantity: Number(quantity),
            contract,
            breakdown,
            total: parseFloat(total.toFixed(2))
        }
    }

    response.status(200).send(result);
});

/* [POST] http://localhost:3000/api/products */
router.post('/', requireSession, canCreateProduct, async (request, response) => {
    const { body } = request;

    if (!body) {
        response.status(400).send({
            message: "Bad request", success: false
        })
    }

    const result = await prisma.product.create({
        data: {
            ...body
        },
        include: {
            productPricing: {
                include: {
                    product: true,
                    contract: true
                }
            }
        }
    })

    response.status(200).send(result);
});

/* [DELETE] http://localhost:3000/api/products/{id} */
router.delete('/:id', async (request, response) => {
    const { id } = request.params;
    const result = await prisma.product.deleteMany({
        where: { id },
    });
    response.status(200).send(result);
});

export default router;