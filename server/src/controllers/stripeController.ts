import { Response, Request } from "express";
import stripe from "../lib/stripe.js";
import { prisma } from "../lib/prisma.js";

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export const stripeWebhook = async (request: Request, response: Response) => {
    if (!stripeWebhookSecret) {
        return response.status(400).json({
            success: false, message: 'undefined STRIPE_WEBHOOK_SECRET!',
        });
    }

    let event;
    const signature = request.headers['stripe-signature'] as string;

    try {
        event = stripe.webhooks.constructEvent(
            request.body, signature, stripeWebhookSecret);
    } catch (exception: any) {
        console.error(`[Stripe] Webhook-Fehler: ${exception.message}`);
        return response.status(500).json({
            success: false, message: 'Stripe Webhook error!',
        });
    }

    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            const userId = session.metadata?.userId as string;

            const shoppingCart = await prisma.shoppingCart.findMany({
                where: { userId: userId },
            });

            const createdOrder = await prisma.$transaction(async (tx) => {
                const order = await tx.order.create({
                    data: { userId: userId },
                });

                shoppingCart.forEach(async (item) => {
                    await prisma.orderPosition.create({
                        data: {
                            orderId: order.id,
                            productId: item.productId,
                            contractId: item.contractId,
                            duration: item.duration,
                            quantity: item.quantity,
                            priceAtPurchase: item.price,
                        }
                    });
                });

                await prisma.shoppingCart.deleteMany({
                    where: { userId },
                });

                return order;
            });

            console.log(`Successfully inserted order ${createdOrder.id}`);

            break;
        default:
            break;
    }

    return response.status(200).json({
        received: true
    });
}