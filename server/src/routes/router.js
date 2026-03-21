import { Router } from 'express';

import productRouter from './products.js';
import cartRouter from './cart.js';

const router = Router();

router.use('/products', productRouter);
router.use('/cart', cartRouter);

export default router;