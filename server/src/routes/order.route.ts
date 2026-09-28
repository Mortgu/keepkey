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
import { validate, validateParams, validateQuery } from "@/middlewares/zod.middleware.js";
import { orderFilterSchema, restoreOrderRevisionSchema } from "@keepit/schemas";
import {
  idParamsSchema,
  orderIdParamsSchema,
  orderRevisionParamsSchema,
} from "@/schemas/params-schemas.js";

const router = Router();

router.get("/", validateQuery(orderFilterSchema), getAllOrders);

router.get("/next-number", getNextOrderNumber);

router.get("/:orderId", validateParams(orderIdParamsSchema), getOrderById);

router.get("/:orderId/revisions", validateParams(orderIdParamsSchema), getOrderRevisions);

router.post(
    "/:orderId/documents",
    validateParams(orderIdParamsSchema),
    generateOrderDocument,
);

router.post('/', validate(acceptOrderSchema), createOrder, createOrderTask);

router.post(
    "/:orderId/revisions/:revisionId/restore",
    validateParams(orderRevisionParamsSchema),
    validate(restoreOrderRevisionSchema),
    restoreOrderRevision,
);

router.patch(
    "/:orderId",
    validateParams(orderIdParamsSchema),
    validate(updateOrderMetadataSchema),
    updateOrder,
);

router.post(
    "/:orderId/cancel",
    validateParams(orderIdParamsSchema),
    validate(restoreOrderRevisionSchema),
    cancelOrder,
);

router.delete("/:id", validateParams(idParamsSchema), deleteOrderById);

export default router;
