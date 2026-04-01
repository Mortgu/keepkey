import { raw, Router } from "express";
import { stripeWebhook } from "../controllers/stripeController.js";

const router = Router();

/* [POST] http://localhost:3000/api/stripe-webhook */
router.post('/', raw({ type: 'application/json' }), stripeWebhook);

export default router;