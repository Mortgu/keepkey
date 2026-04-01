import { Response, Request } from "express";
import stripe from "../lib/stripe.js";

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
            // TODO: Implement actions
            break;
        default:
            break;
    }

    return response.status(200).json({
        received: true
    });
}