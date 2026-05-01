import { Router } from "express";
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
} from "../controllers/supplier-controller.js";
import { validate } from "../middlewares/validate.js";
import { createSupplierSchema } from "../schemas/index.js";

const router = Router();

/* [GET] http://localhost:3000/api/supplier */
router.get("/", getSuppliers);

/* [POST] http://localhost:3000/api/supplier */
router.post("/", validate(createSupplierSchema), createSupplier);

/* [DELETE] http://localhost:3000/api/supplier/:id */
router.delete("/:id", deleteSupplier);

export default router;
