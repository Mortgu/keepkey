import { Router } from "express";
import {
  createFlatRate,
  deleteFlatRate,
  getFlatrate,
  getFlatRate,
  getFlatRates,
  updateFlatRate,
} from "@/controllers/index.js";
import { validate, validateQuery } from "@/middlewares/zod.middleware.js";
import {
  createFlatrateSchema,
  flatrateFilterSchema,
  updateFlatrateSchema,
} from "@keepit/schemas";

const router = Router();

/* [GET] http://localhost:3000/api/flatrates */
router.get("/", validateQuery(flatrateFilterSchema), getFlatRates);

/* [GET] http://localhost:3000/api/flatrates/:id */
router.get("/:id", getFlatrate);

/* [GET] http://localhost:3000/api/flatrates/:id */
router.get("/:id", getFlatRate);

/* [POST] http://localhost:3000/api/flatrates */
router.post("/", validate(createFlatrateSchema), createFlatRate);

/* [PUT] http://localhost:3000/api/flatrates/:id */
router.put("/:id", validate(updateFlatrateSchema), updateFlatRate);

/* [DELETE] http://localhost:3000/api/flatrates/:id */
router.delete("/:id", deleteFlatRate);

export default router;
