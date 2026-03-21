import { Router } from 'express';

import productRouter from './products.js';

const router = Router();

router.use('/products', productRouter);

export default router;