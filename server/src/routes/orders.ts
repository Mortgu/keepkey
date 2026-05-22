import { Router } from "express";
import {
  getOrderById,
  getOrderTasks,
  getAllOrders,
  deleteOrderById,
  createOrder,
  createOrderTask,
} from "../controllers/order-controller.js";
import { validate } from "../middlewares/validate.js";
import { createOrderSchema } from "../schemas/order-schemas.js";

const router = Router();

/* [GET] http://localhost:3000/api/orders */
router.get("/", getAllOrders);

router.get("/:orderId", getOrderById);

router.get("/:orderId/documents", getOrderTasks);

router.post('/', validate(createOrderSchema), createOrder, createOrderTask);

router.delete("/:id", deleteOrderById);

export default router;