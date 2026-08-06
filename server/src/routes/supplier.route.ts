import { Router } from "express";
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "@/controllers/index.js";
import { validate, validateQuery } from "@/middlewares/zod.middleware.js";
import {
  createSupplierSchema, supplierFilterSchema, updateSupplierSchema
} from "@keepit/schemas";

const router = Router();

/* [GET] http://localhost:3000/api/supplier */
router.get("/", validateQuery(supplierFilterSchema), getSuppliers);

/* [POST] http://localhost:3000/api/supplier */
router.post("/", validate(createSupplierSchema), createSupplier);

/* [PUT] http://localhost:3000/api/supplier/:id */
router.put("/:id", validate(updateSupplierSchema), updateSupplier);

/* [DELETE] http://localhost:3000/api/supplier/:id */
router.delete("/:id", deleteSupplier);

export default router;
