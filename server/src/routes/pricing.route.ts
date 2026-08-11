import { deleteOverride, getLivePrice, getPinnedPrice, upsertOverride } from "@/controllers/pricing.controller.js";
import { validate, validateQuery } from "@/middlewares/zod.middleware.js";
import { deleteOverrideSchema, livePriceQuerySchema, pinnedPriceQuerySchema, upsertOverrideSchema } from "@keepit/schemas";
import { Router } from "express";

const router = Router();

router.get('/price/pinned', validateQuery(pinnedPriceQuerySchema), getPinnedPrice);

router.get('/price/live', validateQuery(livePriceQuerySchema), getLivePrice);

router.put('/override', validate(upsertOverrideSchema), upsertOverride);

router.delete('/override', validateQuery(deleteOverrideSchema), deleteOverride);

export default router;