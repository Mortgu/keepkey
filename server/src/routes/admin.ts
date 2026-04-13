import { Router } from "express";
import { canViewOrders } from "../permissions/order.js";
import { requireSession } from "../middlewares/auth.js";
import { getAllOrders } from "../controllers/orderController.js";
import { canViewProducts } from "../permissions/product.js";
import { getAllProducts } from "../controllers/productController.js";
import { canViewAllUsers } from "../permissions/user.js";
import { getAllUsers, getUserById } from "../controllers/userController.js";

const router = Router();

/* [GET] http://localhost:3000/api/admin/orders */
router.get('/orders', requireSession, canViewOrders, getAllOrders);

/* [GET] http://localhost:3000/api/admin/products */
router.get('/products', requireSession, canViewProducts, getAllProducts);

/* [GET] http://localhost:3000/api/admin/users */
router.get('/users', requireSession, canViewAllUsers, getAllUsers);

/* [GET] http://localhost:3000/api/admin/users/{id} */
router.get('/users/{id}', requireSession, getUserById)

export default router;
