import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import { getSessionUser } from "../controllers/userController.js";

const router = Router();

/* [GET] http://localhost:3000/api/users/session */
router.get('/session', requireSession, getSessionUser);

export default router;
