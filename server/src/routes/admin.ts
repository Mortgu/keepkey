import { Router } from "express";
import { canViewOrders } from "../permissions/order.js";
import { requireSession } from "../middlewares/auth.js";
import { getAllOrders } from "../controllers/orderController.js";
import { canViewProducts } from "../permissions/product.js";
import { getProducts } from "../controllers/productController.js";

const router = Router();

/* [GET] http://localhost:3000/api/admin/orders */
router.get('/orders', requireSession, canViewOrders, getAllOrders);

/* [GET] http://localhost:3000/api/admin/products */
//router.get('/products', requireSession, canViewProducts, getProducts);

export default router;
