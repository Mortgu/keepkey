import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";

import contactPersonRouter from "./contact-person-router.js";
import contractRouter from "./contract-router.js";
import customerRouter from "./customer-router.js";
import documentRouter from './document-router.js';
import flatRatesRouter from "./flat-rate-router.js";
import cloudRouter from './nextcloud-router.js';
import integrationsRouter from './integrations-router.js';
import offerRouter from "./offer-router.js";
import orderRouter from "./order-router.js";
import productRouter from "./product-router.js";
import searchRouter from './search-router.js';
import supplierRouter from "./supplier-router.js";
import tariffRouter from './tariff-router.js';
import taskRouter from "./task-router.js";
import userRouter from "./user-router.js";

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
