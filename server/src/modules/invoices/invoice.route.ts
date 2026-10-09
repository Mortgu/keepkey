import { Router } from "express";
import { invoiceFilterSchema } from "@keepit/schemas";
import { getAllInvoices } from "./invoice.controller.js";
import { validateQuery } from "@/core/middleware/zod.middleware.js";

const router = Router();

/* Anlegen und Neu-Erzeugen hängen an der Bestellung: /api/orders/:orderId/invoice */
router.get("/", validateQuery(invoiceFilterSchema), getAllInvoices);

export default router;
