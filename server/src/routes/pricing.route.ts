import { getLivePrice, getPinnedPrice } from "@/controllers/pricing.controller.js";
import { validateQuery } from "@/middlewares/zod.middleware.js";
import { livePriceQuerySchema, pinnedPriceQuerySchema } from "@keepit/schemas";
import { Router } from "express";

const router = Router();

router.get('/price/pinned', validateQuery(pinnedPriceQuerySchema), getPinnedPrice);
router.get('/price/live', validateQuery(livePriceQuerySchema), getLivePrice);

export default router;