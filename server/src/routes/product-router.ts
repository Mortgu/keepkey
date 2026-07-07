import { Router } from "express";
import {
    createProduct,
    deleteProduct,
    getProduct,
    getProducts,
    updateProduct,
} from "../controllers/product.controller.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema, updateProductSchema } from "../schemas/index.js";

const router = Router();

/* [GET] http://localhost:3000/api/products */
router.get("/", getProducts);

/* [GET] http://localhost:3000/api/products/{id} */
router.get("/:id", getProduct);

/* [POST] http://localhost:3000/api/products */
router.post("/", validate(createProductSchema), createProduct);

/* [DELETE] http://localhost:3000/api/products/{id} */
router.delete("/:id", deleteProduct);

/* [PUT] http://localhost:3000/api/products/{id} */
router.put("/:id", validate(updateProductSchema), updateProduct);

export default router;
