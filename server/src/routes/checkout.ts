import { Router } from 'express';
import { requireSession } from '../middlewares/auth.js';
import { handleCheckout, handleGenerate } from '../controllers/checkoutController.js';

const router = Router();

/*
 * Checkout route with stripe
 * [POST] http://localhost:3000/api/checkout
 */
router.post('/', requireSession, handleCheckout);

/* [POST] http://localhost:3000/api/checkout/generate */
router.post('/generate', requireSession, handleGenerate);


export default router;