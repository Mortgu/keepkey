import { Router } from "express";

import { createPricing, deletePricing, getPrice } from "../controllers/pricing-controller.js";
import { validate } from "../middlewares/validate.js";
import { createPricingSchema } from "../schemas/index.js";
import { requireSession } from "../middlewares/auth.js";

const router = Router();

/* 
 * Route for retreiving the price of a configuration
 * [GET] /api/pricing?productId=&contractId=&duration_months=&quantity=
 */
router.get('/', requireSession, getPrice);

/* 
 *  Route for creating new pricing entries
 *  [POST] /api/pricing/:product_id
 */
router.post('/:product_id', requireSession, validate(createPricingSchema), createPricing);

router.delete('/:id', requireSession, deletePricing)

export default router;