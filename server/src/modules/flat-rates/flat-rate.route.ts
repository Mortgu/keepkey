import { Router } from "express";
import { createFlatRate, deleteFlatRate, getFlatRate, getFlatRates, updateFlatRate } from "./flat-rate.controller.js";
import { validate, validateParams, validateQuery } from "@/core/middleware/zod.middleware.js";
import { idParamsSchema } from "@/core/params.schemas.js";
import {
  createFlatrateSchema,
  flatrateFilterSchema,
  updateFlatrateSchema,
} from "@keepit/schemas";

const router = Router();

/* [GET] http://localhost:3000/api/flatrates */
router.get("/", validateQuery(flatrateFilterSchema), getFlatRates);

/* [GET] http://localhost:3000/api/flatrates/:id */
router.get("/:id", validateParams(idParamsSchema), getFlatRate);

/* [POST] http://localhost:3000/api/flatrates */
router.post("/", validate(createFlatrateSchema), createFlatRate);

/* [PUT] http://localhost:3000/api/flatrates/:id */
router.put("/:id", validateParams(idParamsSchema), validate(updateFlatrateSchema), updateFlatRate);

/* [DELETE] http://localhost:3000/api/flatrates/:id */
router.delete("/:id", validateParams(idParamsSchema), deleteFlatRate);

export default router;
