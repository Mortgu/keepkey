import { Router } from "express";
import {
  getOrderById,
  getOrderTasks,
  getAllOrders,
  deleteOrderById,
} from "../controllers/order-controller.js";

const router = Router();

/* [GET] http://localhost:3000/api/orders */
router.get("/", getAllOrders);

router.get("/:orderId", getOrderById);

router.get("/:orderId/documents", getOrderTasks);

router.delete("/:id", deleteOrderById);

export default router;
