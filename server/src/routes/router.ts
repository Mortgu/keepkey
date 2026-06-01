import {Router} from "express";
import {requireSession} from "../middlewares/auth.js";

import adminRouter from "./admin.js";
import productRouter from "./products.js";
import supplierRouter from "./supplier.js";
import userRouter from "./user.js";
import contractRouter from "./contracts.js";
import orderRouter from "./orders.js";
import customerRouter from "./customers.js";
import flatRatesRouter from "./flatrates.js";
import taskRouter from "./task-route.js";
import contactPersonRouter from "./contact-persons.js";
import tariffRouter from './tariff.js';
import documentRouter from './documents.js';
import nextCloudRouter from './nextcould-router.js';
import settingsRouter from './settings-router.js';
import offerRouter from "./offer-router.js";

const router = Router();

/* /api/admin */
router.use("/admin", requireSession, adminRouter);

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
router.use('/documents', documentRouter);

/* /api/nextcloud */
router.use('/nextcloud', nextCloudRouter);

/* /api/settings */
router.use('/settings', settingsRouter);

export default router;
