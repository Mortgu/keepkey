import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import { createOffer, deleteOffer, getOffers } from "../controllers/offerController.js";

const router = Router();

/* [GET] http://localhost:3000/api/offers */
router.get('/', requireSession, getOffers);

/* [POST] http://localhost:3000/api/offers */
router.post('/', requireSession, createOffer);

/* [DELETE] http://localhost:3000/api/offers */
router.delete('/', requireSession, deleteOffer);

export default router;
