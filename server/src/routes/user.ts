import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import { getSessionUser, upsertAddress, createContactPersons } from "../controllers/userController.js";

const router = Router();

/* [GET] http://localhost:3000/api/users/session */
router.get('/session', requireSession, getSessionUser);

/* [POST] http://localhost:3000/api/users/me/address */
router.post('/me/address', requireSession, upsertAddress);

/* [POST] http://localhost:3000/api/users/me/contact-persons */
router.post('/me/contact-persons', requireSession, createContactPersons);

export default router;
