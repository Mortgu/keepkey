import { Router } from "express";

import {
  createPricing,
  deletePricing,
  getPrice,
  updatePricing,
} from "../controllers/pricing-controller.js";
import { validate } from "../middlewares/validate.js";
import { createPricingSchema, updatePricingSchema } from "../schemas/index.js";

const router = Router();

/*
 * Route for retreiving the price of a configuration
 * [GET] /api/pricing?productId=&contractId=&duration_months=&quantity=&customerId=
 */
router.get("/", getPrice);

/*
 *  Route for creating new pricing entries
 *  [POST] /api/pricing/:product_id
 */
router.post("/:product_id", validate(createPricingSchema), createPricing);

/*
 *  Route for updating an existing pricing entry
 *  [PUT] /api/pricing/:id
 */
router.put("/:id", validate(updatePricingSchema), updatePricing);

router.delete("/:id", deletePricing);

export default router;
