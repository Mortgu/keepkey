import { Router } from "express";

import { requireSession } from "@/middlewares/auth.middleware.js";

import contactPersonRouter from "./contact.route.js";
import contractRouter from "./contract.route.js";
import customerRouter from "./customer.route.js";
import documentRouter from './document.route.js';
import flatRatesRouter from "./flatrate.route.js";
import cloudRouter from './nextcloud.route.js';
import integrationsRouter from './integrations.route.js';
import offerRouter from "./offer.route.js";
import orderRouter from "./order.route.js";
import productRouter from "./product.route.js";
import searchRouter from './search.route.js';
import supplierRouter from "./supplier.route.js";
import tariffRouter from './tariff.route.js';
import taskRouter from "./task.route.js";
import userRouter from "./user.route.js";

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

/* /api/cloud */
router.use('/cloud', requireSession, cloudRouter);

/* /api/integrations */
router.use('/integrations', requireSession, integrationsRouter);

/* /api/search */
router.use('/search', requireSession, searchRouter);

export default router;
