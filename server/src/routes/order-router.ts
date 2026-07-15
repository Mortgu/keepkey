import {Router} from "express";
import {
  createOrder,
  createOrderTask,
  deleteOrderById,
  downloadOrderDocument,
  generateOrderDocument,
  getAllOrders,
  getNextOrderNumber,
  getOrderById,
  getOrderRevisions,
  restoreOrderRevision,
  updateOrder,
  uploadOrderDocument,
} from "../controllers/index.js";
import {validate} from "../middlewares/validate.js";
import {createOrderSchema, restoreOrderRevisionSchema, updateOrderSchema} from "../schemas/index.js";

const router = Router();

router.get("/", getAllOrders);

router.get("/next-number", getNextOrderNumber);

router.get("/:orderId", getOrderById);

router.get("/:orderId/revisions", getOrderRevisions);

router.get("/:orderId/documents/:documentId/:format", downloadOrderDocument);

router.post('/:orderId/document', generateOrderDocument);

router.post('/:orderId/documents/:documentId/upload', uploadOrderDocument);

router.post('/', validate(createOrderSchema), createOrder, createOrderTask);

router.post('/:orderId/revisions/:revisionId/restore', validate(restoreOrderRevisionSchema), restoreOrderRevision);

router.patch('/:orderId', validate(updateOrderSchema), updateOrder);

router.delete("/:id", deleteOrderById);

export default router;
