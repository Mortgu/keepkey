import { Router } from "express";
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "../controllers/supplier-controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createSupplierSchema,
  updateSupplierSchema,
} from "../schemas/index.js";

const router = Router();

/* [GET] http://localhost:3000/api/supplier */
router.get("/", getSuppliers);

/* [POST] http://localhost:3000/api/supplier */
router.post("/", validate(createSupplierSchema), createSupplier);

/* [PUT] http://localhost:3000/api/supplier/:id */
router.put("/:id", validate(updateSupplierSchema), updateSupplier);

/* [DELETE] http://localhost:3000/api/supplier/:id */
router.delete("/:id", deleteSupplier);

export default router;
