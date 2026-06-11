import {Router} from "express";
import {requireSession} from "../middlewares/auth.js";

import productRouter from "./product-router.js";
import supplierRouter from "./supplier-router.js";
import userRouter from "./user-router.js";
import contractRouter from "./contract-router.js";
import orderRouter from "./order-router.js";
import customerRouter from "./customer-router.js";
import flatRatesRouter from "./flat-rate-router.js";
import taskRouter from "./task-router.js";
import contactPersonRouter from "./contact-person-router.js";
import tariffRouter from './tariff-router.js';
import documentRouter from './document-router.js';
import cloudRouter from './nextcloud-router.js';
import offerRouter from "./offer-router.js";

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
router.use('/documents', documentRouter);

/* /api/cloud */
router.use('/cloud', cloudRouter);

export default router;
