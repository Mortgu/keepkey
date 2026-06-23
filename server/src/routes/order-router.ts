import {Router} from "express";
import {
  createOrder,
  createOrderTask,
  deleteOrderById,
  downloadOrderDocument,
  generateOrderDocument,
  getAllOrders,
  getOrderById,
  uploadOrderDocument,
} from "../controllers/index.js";
import {validate} from "../middlewares/validate.js";
import {createOrderSchema} from "../schemas/index.js";

const router = Router();

router.get("/", getAllOrders);

router.get("/:orderId", getOrderById);

router.get("/:orderId/documents/:documentId/:format", downloadOrderDocument);

router.post('/:orderId/document', generateOrderDocument);

router.post('/:orderId/documents/:documentId/upload', uploadOrderDocument);

router.post('/', validate(createOrderSchema), createOrder, createOrderTask);

router.delete("/:id", deleteOrderById);

export default router;
