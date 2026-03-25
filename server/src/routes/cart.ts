import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import { createSessionShoppingCart, deleteSessionShoppingCart, deleteShoppingCart, getSessionShoppingCart, getShoppingCart } from "../controllers/checkoutController.js";
import { canDeleteShoppingCarts, canViewShoppingCarts } from "../permissions/cart.js";

const router = Router();

/* [GET] http://localhost:3000/api/cart/{userId} */
router.get('/:userId', requireSession, canViewShoppingCarts, getShoppingCart);

/* [GET] http://localhost:3000/api/cart */
router.get('/', requireSession, getSessionShoppingCart);

/* [POST] http://localhost:3000/api/cart */
router.post('/', requireSession, createSessionShoppingCart);

/* [DELETE] http://localhost:3000/api/cart */
router.delete('/', requireSession, deleteSessionShoppingCart);

/* [DELETE] http://localhost:3000/api/cart/{userId} */
router.delete('/:userId', requireSession, canDeleteShoppingCarts, deleteShoppingCart);

export default router;
