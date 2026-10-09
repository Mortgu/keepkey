import { Router } from "express";
import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from "./supplier.controller.js";
import { validate, validateParams, validateQuery } from "@/core/middleware/zod.middleware.js";
import { idParamsSchema } from "@/core/params.schemas.js";
import {
  createSupplierSchema, supplierFilterSchema, updateSupplierSchema
} from "@keepit/schemas";

const router = Router();

/* [GET] http://localhost:3000/api/supplier */
router.get("/", validateQuery(supplierFilterSchema), getSuppliers);

/* [POST] http://localhost:3000/api/supplier */
router.post("/", validate(createSupplierSchema), createSupplier);

/* [PUT] http://localhost:3000/api/supplier/:id */
router.put("/:id", validateParams(idParamsSchema), validate(updateSupplierSchema), updateSupplier);

/* [DELETE] http://localhost:3000/api/supplier/:id */
router.delete("/:id", validateParams(idParamsSchema), deleteSupplier);

export default router;
