import { Request, Response } from "express";
import stripe from "../lib/stripe.js";
import { prisma } from "../lib/prisma.js";
import { cursorTo } from "node:readline";

export const handleCheckout = async (request: Request, response: Response) => {
    const user = request.user;

    if (!user) {
        return response.sendStatus(400);
    }

    /* Get shopping cart from session user */
    const shoppingCart = await prisma.shoppingCart.findMany({
        where: { userId: user?.id },
        include: {
            product: true
        }
    });

    if (shoppingCart.length <= 0) {
        return response.status(400).json({
            success: false, message: 'Shopping cart is empty!',
        });
    }

    const line_items = [];

    for (let entry of shoppingCart) {
        line_items.push({
            price_data: {
                currency: 'eur',
                unit_amount: entry.price * 100,
                product_data: {
                    name: entry.product.name,
                }
            },
            quantity: 1,
        });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
        line_items: line_items,
        mode: 'payment',
        metadata: {
            userId: user.id,
        },

        success_url: 'http://localhost:5173/checkout?status=success',
        cancel_url: 'http://localhost:5173/checkout?status=failed',
    });

    return response.status(200).json({
        url: checkoutSession.url,
    });
}