import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import { createSupplier, deleteSupplier, getSuppliers } from "../controllers/supplierController.js";

const router = Router();

/* [GET] http://localhost:3000/api/supplier */
router.get('/', getSuppliers);

/* [POST] http://localhost:3000/api/supplier */
router.post('/', requireSession, createSupplier);

/* [DELETE] http://localhost:3000/api/supplier */
router.delete('/', requireSession, deleteSupplier);

export default router;
