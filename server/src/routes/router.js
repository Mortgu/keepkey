import { Router } from 'express';

import productRouter from './products.js';
import cartRouter from './cart.js';
import userRouter from './user.js';

const router = Router();

router.use('/products', productRouter);
router.use('/cart', cartRouter);
router.use('/users', userRouter);

export default router;