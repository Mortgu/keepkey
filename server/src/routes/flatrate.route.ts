import { Router } from "express";
import {
  createFlatRate,
  deleteFlatRate,
  getFlatrate,
  getFlatRate,
  getFlatRates,
  updateFlatRate,
} from "@/controllers/index.js";
import { validate } from "@/middlewares/zod.middleware.js";
import {
  createFlatRateSchema,
  updateFlatRateSchema,
} from "@/schemas/index.js";

const router = Router();

/* [GET] http://localhost:3000/api/flatrates */
router.get("/", getFlatRates);

/* [GET] http://localhost:3000/api/flatrates/:id */
router.get("/:id", getFlatrate);

/* [GET] http://localhost:3000/api/flatrates/:id */
router.get("/:id", getFlatRate);

/* [POST] http://localhost:3000/api/flatrates */
router.post("/", validate(createFlatRateSchema), createFlatRate);

/* [PUT] http://localhost:3000/api/flatrates/:id */
router.put("/:id", validate(updateFlatRateSchema), updateFlatRate);

/* [DELETE] http://localhost:3000/api/flatrates/:id */
router.delete("/:id", deleteFlatRate);

export default router;
