import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";

import adminRouter from "./admin.js";
import productRouter from "./products.js";
import supplierRouter from "./supplier.js";
import userRouter from "./user.js";
import contractRouter from "./contracts.js";
import orderRouter from "./orders.js";
import customerRouter from "./customers.js";
import offerRouter from "./offer.js";
import flatratesRoter from "./flatrates.js";
import taskRouter from "./task-route.js";
import contactPersonRouter from "./contact-persons.js";
import tariffRouter from './tariff.js';

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
router.use("/flatrates", requireSession, flatratesRoter);

/* /api/task */
router.use("/task", requireSession, taskRouter);

/* /api/contact-persons */
router.use("/contact-persons", requireSession, contactPersonRouter);

router.use("/tariffs", requireSession, tariffRouter);

export default router;
