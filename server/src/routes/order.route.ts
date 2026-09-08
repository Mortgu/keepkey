import { cancelOrder } from "@/controllers/order.controller.js";
import { acceptOrderSchema, updateOrderMetadataSchema } from "@/schemas/order-inputs.js";
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
import { restoreOrderRevisionSchema } from "@keepit/schemas";

const router = Router();

router.get("/", getAllOrders);

router.get("/next-number", getNextOrderNumber);

router.get("/:orderId", getOrderById);

router.get("/:orderId/revisions", getOrderRevisions);

router.post('/:orderId/documents', generateOrderDocument);

router.post('/', validate(acceptOrderSchema), createOrder, createOrderTask);

router.post('/:orderId/revisions/:revisionId/restore', validate(restoreOrderRevisionSchema), restoreOrderRevision);

router.patch('/:orderId', validate(updateOrderMetadataSchema), updateOrder);

router.post("/:orderId/cancel", validate(restoreOrderRevisionSchema), cancelOrder);

router.delete("/:id", deleteOrderById);

export default router;
