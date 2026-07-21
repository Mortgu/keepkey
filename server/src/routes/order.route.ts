import { Router } from "express";
import {
  createOrder,
  createOrderTask,
  deleteOrderById,
  generateOrderDocument,
  getAllOrders,
  getNextOrderNumber,
  getOrderById,
  getOrderRevisions,
  restoreOrderRevision,
  updateOrder,
} from "@/controllers/index.js";
import { validate } from "@/middlewares/zod.middleware.js";
import {
  createOrderSchema,
  restoreOrderRevisionSchema,
  updateOrderSchema
} from "@/schemas/index.js";

const router = Router();

router.get("/", getAllOrders);

router.get("/next-number", getNextOrderNumber);

router.get("/:orderId", getOrderById);

router.get("/:orderId/revisions", getOrderRevisions);

router.post('/:orderId/documents', generateOrderDocument);

router.post('/', validate(createOrderSchema), createOrder, createOrderTask);

router.post('/:orderId/revisions/:revisionId/restore', validate(restoreOrderRevisionSchema), restoreOrderRevision);

router.patch('/:orderId', validate(updateOrderSchema), updateOrder);

router.delete("/:id", deleteOrderById);

export default router;
