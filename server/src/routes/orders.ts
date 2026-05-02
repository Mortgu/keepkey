import { Router } from "express";
import {
  getOrderById,
  getOrderDocumentJobs,
  getAllOrders,
  deleteOrderById,
} from "../controllers/order-controller.js";

const router = Router();

/* [GET] http://localhost:3000/api/orders */
router.get("/", getAllOrders);

router.get("/:orderId", getOrderById);

router.get("/:orderId/documents", getOrderDocumentJobs);

router.delete("/:id", deleteOrderById);

export default router;
