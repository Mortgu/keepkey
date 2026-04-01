import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET || "", {
    apiVersion: "2026-03-25.dahlia"
});

export default stripe;