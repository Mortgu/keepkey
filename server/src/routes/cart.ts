import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import { createSessionShoppingCart, deleteSessionShoppingCart, deleteShoppingCart, getSessionShoppingCart, getShoppingCart, removeFromShoppingCart } from "../controllers/shoppingCartController.js";
import { canViewShoppingCarts } from "../permissions/cart.js";

const router = Router();

/* [GET] http://localhost:3000/api/shopping-cart/{userId} */
router.get('/:userId', requireSession, canViewShoppingCarts, getShoppingCart);

/* [GET] http://localhost:3000/api/shopping-cart */
router.get('/', requireSession, getSessionShoppingCart);

/* [POST] http://localhost:3000/api/shopping-cart */
router.post('/', requireSession, createSessionShoppingCart);

/* [PUT] http://localhost:3000/api/shopping-cart */
router.put('/:userId', requireSession, removeFromShoppingCart);

/* [DELETE] http://localhost:3000/api/shopping-cart */
router.delete('/', requireSession, deleteSessionShoppingCart);

/* [DELETE] http://localhost:3000/api/shopping-cart/{userId} */
router.delete('/:userId', requireSession, deleteShoppingCart);



export default router;
