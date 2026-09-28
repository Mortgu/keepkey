import { Router } from "express";
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct,
} from "@/controllers/product.controller.js";
import { validate, validateParams, validateQuery } from "@/middlewares/zod.middleware.js";
import { idParamsSchema } from "@/schemas/params-schemas.js";

import {
    createProductSchema,
    updateProductSchema,
    workloadFilterSchema
} from '@keepit/schemas';

const router = Router();

/* [GET] http://localhost:3000/api/products */
router.get("/", validateQuery(workloadFilterSchema), getProducts);

/* [GET] http://localhost:3000/api/products/:id */
router.get("/:id", validateParams(idParamsSchema), getProduct);

/* [POST] http://localhost:3000/api/products */
router.post("/", validate(createProductSchema), createProduct);

/* [DELETE] http://localhost:3000/api/products/:id */
router.delete("/:id", validateParams(idParamsSchema), deleteProduct);

/* [PUT] http://localhost:3000/api/products/:id */
router.put("/:id", validateParams(idParamsSchema), validate(updateProductSchema), updateProduct);

export default router;
