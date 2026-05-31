import { Router } from "express";
import {
  getOrderById,
  getAllOrders,
  deleteOrderById,
  createOrder,
  createOrderTask,
  generateOrderDocument,
} from "../controllers/order-controller.js";
import { validate } from "../middlewares/validate.js";
import { createOrderSchema } from "../schemas/order-schemas.js";

const router = Router();

router.get("/", getAllOrders);

router.get("/:orderId", getOrderById);

router.post('/:orderId/document', generateOrderDocument);

router.post('/', validate(createOrderSchema), createOrder, createOrderTask);

router.delete("/:id", deleteOrderById);

export default router;
