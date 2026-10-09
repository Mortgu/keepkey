import { Router } from "express";

import { requireSession } from "@/core/middleware/auth.middleware.js";

import contactPersonRouter from "@/modules/customers/contact-person.route.js";
import contractRouter from "@/modules/contracts/contract.route.js";
import customerRouter from "@/modules/customers/customer.route.js";
import dashboardRouter from "@/modules/dashboard/dashboard.route.js";
import documentTemplateRouter from '@/modules/documents/templates/document-template.route.js';
import documentRouter from '@/modules/documents/document.route.js';
import flatRatesRouter from "@/modules/flat-rates/flat-rate.route.js";
import cloudRouter from '@/modules/integrations/nextcloud.route.js';
import integrationsRouter from '@/modules/integrations/integration.route.js';
import offerRouter from "@/modules/offers/offer.route.js";
import orderRouter from "@/modules/orders/order.route.js";
import invoiceRouter from "@/modules/invoices/invoice.route.js";
import productRouter from "@/modules/products/product.route.js";
import searchRouter from '@/modules/search/search.route.js';
import supplierRouter from "@/modules/suppliers/supplier.route.js";
import tariffRouter from '@/modules/tariffs/tariff.route.js';
import taskRouter from "@/modules/tasks/task.route.js";
import userRouter from "@/modules/users/user.route.js";

const router = Router();

/* /api/products */
router.use("/products", requireSession, productRouter);

/* /api/suppliers */
router.use("/suppliers", requireSession, supplierRouter);

/* /api/offers */
router.use("/offers", requireSession, offerRouter);

/* /api/users */
router.use("/users", requireSession, userRouter);

/* /api/contracts */
router.use("/contracts", requireSession, contractRouter);

/* /api/orders */
router.use("/orders", requireSession, orderRouter);
router.use("/invoices", requireSession, invoiceRouter);

/* /api/customers */
router.use("/customers", requireSession, customerRouter);

/* /api/flatrates */
router.use("/flatrates", requireSession, flatRatesRouter);

/* /api/task */
router.use("/tasks", requireSession, taskRouter);

/* /api/contact-persons */
router.use("/contact-persons", requireSession, contactPersonRouter);

/* /api/tariffs */
router.use("/tariffs", requireSession, tariffRouter);

/* /api/documents */
router.use('/documents', requireSession, documentRouter);

/* /api/templates */
router.use('/templates', requireSession, documentTemplateRouter);

/* /api/cloud */
router.use('/cloud', requireSession, cloudRouter);

/* /api/integrations */
router.use('/integrations', requireSession, integrationsRouter);

/* /api/search */
router.use('/search', requireSession, searchRouter);

/* /api/dashboard */
router.use('/dashboard', requireSession, dashboardRouter);

export default router;
