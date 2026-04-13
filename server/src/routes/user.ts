import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import { getSessionUser, upsertAddress, createContactPersons, deleteAccount, updateUserById, createUser, deleteUser } from "../controllers/userController.js";

const router = Router();

/* [GET] http://localhost:3000/api/users/session */
router.get('/session', requireSession, getSessionUser);

/* [POST] http://localhost:3000/api/users/{id} */
router.post('/:id', requireSession, updateUserById);

/* [POST] http://localhost:3000/api/users/ */
/* canCreateUsers */
router.post('/', requireSession, createUser)

/* [DELETE] http://localhost:3000/api/users */
/* canDeleteUser */
router.delete('/:id', requireSession, deleteUser);

/* [DELETE] http://localhost:3000/api/users */
router.delete('/', requireSession, deleteAccount);

/* [POST] http://localhost:3000/api/users/me/address */
router.post('/me/address', requireSession, upsertAddress);

/* [POST] http://localhost:3000/api/users/me/contact-persons */
router.post('/me/contact-persons', requireSession, createContactPersons);

export default router;
