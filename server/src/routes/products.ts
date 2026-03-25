import type { Request, Response } from "express";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { canCreateProduct, canDeleteProduct } from "../permissions/product.js";
import { requireSession } from "../middlewares/auth.js";
import type { Prisma } from "@prisma/client";
import { createProduct, getProduct, getProducts, deleteProduct } from "../controllers/productController.js";

const router = Router();

/* [GET] http://localhost:3000/api/products */
router.get('/', getProducts);

/* [GET] http://localhost:3000/api/products/{id} */
router.get('/:id', getProduct);

/* [POST] http://localhost:3000/api/products */
router.post('/', requireSession, canCreateProduct, createProduct);

/* [DELETE] http://localhost:3000/api/products/{id} */
router.delete('/:id', requireSession, canDeleteProduct, deleteProduct);

export default router;
