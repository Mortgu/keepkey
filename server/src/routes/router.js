import { Router } from 'express';

import productRouter from './products.js';
import cartRouter from './cart.js';
import userRouter from './user.js';
import contractRouter from './contracts.js';
import pricingRouter from './pricing.js';
import orderRouter from './orders.js';

const router = Router();

router.use('/products', productRouter);
router.use('/cart', cartRouter);
router.use('/users', userRouter);
router.use('/contracts', contractRouter);
router.use('/pricing', pricingRouter);
router.use('/orders', orderRouter);

export default router;