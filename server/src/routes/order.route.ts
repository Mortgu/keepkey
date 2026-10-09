import {
    cancelOrder,
    createConfirmation,
    createInvoice,
    createOrder,
    createOrderTask,
    deleteOrderById,
    generateOrderDocument,
    getAllOrders,
    getConfirmation,
    getInvoice,
    getNextOrderNumber,
    getOrderById,
    regenerateConfirmation,
    regenerateInvoice,
    updateOrder
} from "@/controllers/index.js";
import { validate, validateParams, validateQuery } from "@/middlewares/zod.middleware.js";
import { acceptOrderSchema, updateOrderMetadataSchema } from "@/schemas/order-inputs.js";
import {
    idParamsSchema,
    orderIdParamsSchema
} from "@/schemas/params-schemas.js";
import { createConfirmationSchema, createInvoiceSchema, orderFilterSchema } from "@keepit/schemas";
import { Router } from "express";

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
    cancelOrder,
);

router.delete("/:id", validateParams(idParamsSchema), deleteOrderById);

export default router;
