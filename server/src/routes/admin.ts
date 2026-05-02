import { Router } from "express";
import { getAllOrders } from "../controllers/order-controller.js";
import { getProducts } from "../controllers/product-controller.js";
import { getAllUsers, getUserById } from "../controllers/user-controller.js";

const router = Router();

/* [GET] http://localhost:3000/api/admin/orders */
router.get("/orders", getAllOrders);

/* [GET] http://localhost:3000/api/admin/products */
router.get("/products", getProducts);

/* [GET] http://localhost:3000/api/admin/users */
router.get("/users", getAllUsers);

/* [GET] http://localhost:3000/api/admin/users/{id} */
router.get("/users/{id}", getUserById);

export default router;
