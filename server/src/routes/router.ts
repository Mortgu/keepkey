import { Router } from 'express';

import adminRouter from './admin.js';
import productRouter from './products.js';
import supplierRouter from './supplier.js';
import userRouter from './user.js';
import contractRouter from './contracts.js';
import pricingRouter from './pricing.js';
import orderRouter from './orders.js';
import customerRouter from './customers.js';

const router = Router();

/* /api/admin */
router.use('/admin', adminRouter);

/* /api/products */
router.use('/products', productRouter);

/* /api/suppliers */
router.use('/suppliers', supplierRouter);

/* /api/users */
router.use('/users', userRouter);

/* /api/contracts */
router.use('/contracts', contractRouter);

/* /api/pricing */
router.use('/pricing', pricingRouter);

/* /api/orders */
router.use('/orders', orderRouter);

/* /api/customers */
router.use('/customers', customerRouter);

export default router;
