import { json, raw, Request, Response, Router } from "express";
import stripe from "../lib/stripe.js";

const router = Router();

const entpoint_secret = process.env.STRIPE_WEBHOOK_SECRET;

/* [POST] http://localhost:3000/api/stripe-webhook */
router.post('/', raw({ type: 'application/json' }), async (request: Request, response: Response) => {
    let event;

    if (entpoint_secret) {
        const signature = request.headers['stripe-signature'];

        try {
            event = stripe.webhooks.constructEvent(
                request.body,
                signature as string,
                entpoint_secret as string,
            );
        } catch (error: any) {
            console.error(`Webhook-Fehler: ${error.message}`);
            return response.status(400).send(`Webhook Error: ${error.message}`);
        }

        switch (event.type) {
            case "checkout.session.completed":
                // 1. Create Order in Database

                // 2. Clear user ShoppingCart
                break;
            default:
                console.log(event.data.object);
                break;
        }
    }

    return response.status(200).json({ received: true });
});

export default router;