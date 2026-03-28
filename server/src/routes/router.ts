import { Router } from 'express';

import adminRouter from './admin.js';
import productRouter from './products.js';
import cartRouter from './cart.js';
import userRouter from './user.js';
import contractRouter from './contracts.js';
import pricingRouter from './pricing.js';
import orderRouter from './orders.js';

const router = Router();

/* http://localhost:3000/api/admin */
router.use('/admin', adminRouter);

/* http://localhost:3000/api/products */
router.use('/products', productRouter);

/* http://localhost:3000/api/cart */
router.use('/cart', cartRouter);

/* http://localhost:3000/api/users */
router.use('/users', userRouter);

/* http://localhost:3000/api/contracts */
router.use('/contracts', contractRouter);

/* http://localhost:3000/api/pricing */
router.use('/pricing', pricingRouter);

/* http://localhost:3000/api/orders */
router.use('/orders', orderRouter);

export default router;
