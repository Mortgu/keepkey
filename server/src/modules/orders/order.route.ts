import { cancelOrder } from "./order.controller.js";
import { acceptOrderSchema, updateOrderMetadataSchema } from "./order-inputs.js";
import { Router } from "express";
import { createConfirmation, getConfirmation, regenerateConfirmation } from "@/modules/confirmations/confirmation.controller.js";
import { createInvoice, getInvoice, regenerateInvoice } from "@/modules/invoices/invoice.controller.js";
import { createOrder, createOrderTask, deleteOrderById, generateOrderDocument, getAllOrders, getNextOrderNumber, getOrderById, updateOrder } from "./order.controller.js";
import { validate, validateParams, validateQuery } from "@/core/middleware/zod.middleware.js";
import { createConfirmationSchema, createInvoiceSchema, orderFilterSchema, cancelOrderSchema } from "@keepit/schemas";
import {
  idParamsSchema,
  orderIdParamsSchema,
} from "@/core/params.schemas.js";

const router = Router();

router.get("/", validateQuery(orderFilterSchema), getAllOrders);

router.get("/next-number", getNextOrderNumber);

router.get("/:orderId", validateParams(orderIdParamsSchema), getOrderById);

router.post(
    "/:orderId/documents",
    validateParams(orderIdParamsSchema),
    generateOrderDocument,
);

/* Auftragsbestätigung — eine je Bestellung, Nummer vom Nutzer. */
router.get("/:orderId/confirmation", validateParams(orderIdParamsSchema), getConfirmation);
router.post(
    "/:orderId/confirmation",
    validateParams(orderIdParamsSchema),
    validate(createConfirmationSchema),
    createConfirmation,
  createInvoice,
);
router.post("/:orderId/confirmation/documents", validateParams(orderIdParamsSchema), regenerateConfirmation);

/* Rechnung — eine je Bestellung, Nummer vom Nutzer. */
router.get("/:orderId/invoice", validateParams(orderIdParamsSchema), getInvoice);
router.post(
    "/:orderId/invoice",
    validateParams(orderIdParamsSchema),
    validate(createInvoiceSchema),
    createInvoice,
);
router.post("/:orderId/invoice/documents", validateParams(orderIdParamsSchema), regenerateInvoice);

router.post('/', validate(acceptOrderSchema), createOrder, createOrderTask);

router.patch(
    "/:orderId",
    validateParams(orderIdParamsSchema),
    validate(updateOrderMetadataSchema),
    updateOrder,
);

router.post(
    "/:orderId/cancel",
    validateParams(orderIdParamsSchema),
    validate(cancelOrderSchema),
    cancelOrder,
);

router.delete("/:id", validateParams(idParamsSchema), deleteOrderById);

export default router;
