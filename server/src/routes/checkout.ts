import { Router } from 'express';
import { requireSession } from '../middlewares/auth.js';
import { handleCheckout } from '../controllers/checkoutController.js';

const router = Router();

/*
 * Checkout route with stripe
 * [POST] http://localhost:3000/api/checkout
 */
router.post('/', requireSession, handleCheckout);


export default router;