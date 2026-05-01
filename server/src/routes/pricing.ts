import { Router } from "express";

import {
  createPricing,
  deletePricing,
  getPrice,
} from "../controllers/pricing-controller.js";
import { validate } from "../middlewares/validate.js";
import { createPricingSchema } from "../schemas/index.js";

const router = Router();

/*
 * Route for retreiving the price of a configuration
 * [GET] /api/pricing?productId=&contractId=&duration_months=&quantity=
 */
router.get("/", getPrice);

/*
 *  Route for creating new pricing entries
 *  [POST] /api/pricing/:product_id
 */
router.post("/:product_id", validate(createPricingSchema), createPricing);

router.delete("/:id", deletePricing);

export default router;
