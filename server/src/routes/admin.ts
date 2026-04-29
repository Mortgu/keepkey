import { Router } from "express";
import { canViewOrders } from "../permissions/order.js";
import { requireSession } from "../middlewares/auth.js";
import { getAllOrders } from "../controllers/order-controller.js";
import { canViewProducts } from "../permissions/product.js";
import { getProducts } from "../controllers/product-controller.js";
import { canViewAllUsers } from "../permissions/user.js";
import { getAllUsers, getUserById } from "../controllers/user-controller.js";

const router = Router();

/* [GET] http://localhost:3000/api/admin/orders */
router.get("/orders", requireSession, canViewOrders, getAllOrders);

/* [GET] http://localhost:3000/api/admin/products */
router.get("/products", requireSession, canViewProducts, getProducts);

/* [GET] http://localhost:3000/api/admin/users */
router.get("/users", requireSession, canViewAllUsers, getAllUsers);

/* [GET] http://localhost:3000/api/admin/users/{id} */
router.get("/users/{id}", requireSession, getUserById);

export default router;
