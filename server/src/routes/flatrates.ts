import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import {
  createFlatRate,
  deleteFlatRate,
  getFlatRate,
  getFlatRates,
  updateFlatRate,
} from "../controllers/flatrate-controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createFlatRateSchema,
  updateFlatRateSchema,
} from "../schemas/index.js";

const router = Router();

/* [GET] http://localhost:3000/api/flatrates */
router.get("/", getFlatRates);

/* [GET] http://localhost:3000/api/flatrates/:id */
router.get("/:id", getFlatRate);

/* [POST] http://localhost:3000/api/flatrates */
router.post(
  "/",
  requireSession,
  validate(createFlatRateSchema),
  createFlatRate,
);

/* [PUT] http://localhost:3000/api/flatrates/:id */
router.put(
  "/:id",
  requireSession,
  validate(updateFlatRateSchema),
  updateFlatRate,
);

/* [DELETE] http://localhost:3000/api/flatrates/:id */
router.delete("/:id", requireSession, deleteFlatRate);

export default router;
