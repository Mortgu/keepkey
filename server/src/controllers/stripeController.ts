import { Response, Request } from "express";
import stripe from "../lib/stripe.js";
import { prisma } from "../lib/prisma.js";
import { documentQueue, documentQueueKey } from "../lib/queues.js";

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

                for (const item of shoppingCart) {
                    await tx.orderPosition.create({
                        data: {
                            orderId: order.id,
                            productId: item.productId,
                            contractId: item.contractId,
                            duration: item.duration,
                            quantity: item.quantity,
                            priceAtPurchase: item.price || 0,
                        }
                    });
                }

                await prisma.shoppingCart.deleteMany({
                    where: { userId },
                });

                return order;
            });

            console.log(`Successfully inserted order ${createdOrder.id}`);

            // TODO: generate Invoice
            // 1. Create document job
            const documentJob = await prisma.documentJob.create({
                data: { orderId: createdOrder.id, type: 'invoice', status: 'pending' }
            });

            // 2. Queue task
            const bullJob = await documentQueue.add(documentQueueKey, {
                documentJobId: documentJob.id, type: 'invoice', orderId: createdOrder.id,
            });

            // BullMQ Job-ID zurückschreiben
            await prisma.documentJob.update({
                where: { id: documentJob.id },
                data: { jobId: bullJob.id },
            });

            break;
        default:
            break;
    }

    return response.status(200).json({
        received: true
    });
}