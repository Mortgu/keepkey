import type { Request, Response } from "express";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  getOrderById,
  getOrderDocumentJobs,
  getAllOrders,
} from "../controllers/order-controller.js";

const router = Router();

/* [GET] http://localhost:3000/api/orders */
router.get("/", getAllOrders);

router.get("/:orderId", getOrderById);

router.get("/:orderId/documents", getOrderDocumentJobs);

router.delete("/:id", async (request: Request, response: Response) => {
  const { id } = request.params;

  await prisma.order.delete({
    where: { id: id as string },
  });

  return response.status(200).send({
    message: "Deletion successfully",
    success: true,
  });
});

export default router;
