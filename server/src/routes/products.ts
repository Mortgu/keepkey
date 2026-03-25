import type { Request, Response } from "express";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { canCreateProduct } from "../permissions/product.js";
import { requireSession } from "../middlewares/auth.js";
import type { Prisma } from "@prisma/client";

const router = Router();

/* [GET] http://localhost:3000/api/products */
router.get('/', async (request: Request, response: Response) => {
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
router.get('/:id', async (request: Request, response: Response) => {
    const { id } = request.params;
    const { quantity, contract } = request.query;

    // Handle query params which can be strings or arrays
    const quantityStr = Array.isArray(quantity) ? quantity[0] : quantity;
    const contractStr = Array.isArray(contract) ? contract[0] : contract;

    const product = await prisma.product.findUnique({
        where: { id: id as string },
        include: {
            productPricing: true
        }
    }) as Prisma.ProductGetPayload<{ include: { productPricing: true } }> | null;

    if (!product) {
        return response.status(404).json({
            success: false, message: 'Product not found',
        });
    }

    let total = 0;
    let remainingQuantity = Number(quantityStr);

    // Filter pricing by contract and sort by min_quantity
    const applicablePricing = (product as Prisma.ProductGetPayload<{ include: { productPricing: true } }>).productPricing
        .filter((pricing: any) => !contractStr || pricing.contractId === contractStr)
        .sort((a: any, b: any) => a.min_quantity - b.min_quantity);

    // Calculate tiered pricing with breakdown
    const breakdown: any[] = [];
    for (const pricing of applicablePricing) {
        if (remainingQuantity <= 0) break;

        // If max_quantity is 0 or null, it's unlimited - use all remaining quantity
        const isUnlimited = pricing.max_quantity === 0 || pricing.max_quantity === null;
        const rangeSize = isUnlimited ? remainingQuantity : (pricing.max_quantity || 0) - pricing.min_quantity + 1;
        const quantityInThisTier = Math.min(remainingQuantity, rangeSize);
        const subtotal = quantityInThisTier * Number(pricing.price);

        breakdown.push({
            range: isUnlimited ? `${pricing.min_quantity}+` : `${pricing.min_quantity}-${pricing.max_quantity}`,
            minQuantity: pricing.min_quantity,
            maxQuantity: pricing.max_quantity || null,
            quantity: quantityInThisTier,
            pricePerUnit: Number(pricing.price),
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
router.post('/', requireSession, canCreateProduct, async (request: Request, response: Response) => {
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
router.delete('/:id', async (request: Request, response: Response) => {
    const { id } = request.params;
    const result = await prisma.product.delete({
        where: { id: id as string },
    });
    response.status(200).send(result);
});

export default router;
