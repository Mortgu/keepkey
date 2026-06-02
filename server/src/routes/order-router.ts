import {Router} from "express";
import {
  createOrder,
  createOrderTask,
  deleteOrderById,
  generateOrderDocument,
  getAllOrders,
  getOrderById,
} from "../controllers/index.js";
import {validate} from "../middlewares/validate.js";
import {createOrderSchema} from "../schemas/index.js";

const router = Router();

router.get("/", getAllOrders);

router.get("/:orderId", getOrderById);

router.post('/:orderId/document', generateOrderDocument);

router.post('/', validate(createOrderSchema), createOrder, createOrderTask);

router.delete("/:id", deleteOrderById);

export default router;
