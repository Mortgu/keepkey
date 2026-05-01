import { Router } from "express";
import {
  canCreateProduct,
  canDeleteProduct,
  canUpdateProduct,
} from "../permissions/product.js";
import {
  createProduct,
  getProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} from "../controllers/product-controller.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema, updateProductSchema } from "../schemas/index.js";

const router = Router();

/* [GET] http://localhost:3000/api/products */
router.get("/", getProducts);

/* [GET] http://localhost:3000/api/products/{id} */
router.get("/:id", getProduct);

/* [POST] http://localhost:3000/api/products */
router.post(
  "/",
  canCreateProduct,
  validate(createProductSchema),
  createProduct,
);

/* [DELETE] http://localhost:3000/api/products/{id} */
router.delete("/:id", canDeleteProduct, deleteProduct);

/* [PUT] http://localhost:3000/api/products/{id} */
router.put(
  "/:id",
  canUpdateProduct,
  validate(updateProductSchema),
  updateProduct,
);

export default router;
