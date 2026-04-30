import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import {
  getSessionUser,
  createContactPersons,
  deleteAccount,
  updateUserById,
  createUser,
  deleteUser,
  getAllUsers,
} from "../controllers/user-controller.js";
import { validate } from "../middlewares/validate.js";
import {
  createUserSchema,
  updateUserSchema,
  upsertAddressSchema,
  createContactPersonsSchema,
} from "../schemas/index.js";

const router = Router();

/* [GET] http://localhost:3000/api/users */
router.get("/", requireSession, getAllUsers);

/* [GET] http://localhost:3000/api/users/session */
router.get("/session", requireSession, getSessionUser);

/* [POST] http://localhost:3000/api/users/{id} */
router.post("/:id", requireSession, validate(updateUserSchema), updateUserById);

/* [POST] http://localhost:3000/api/users/ */
/* canCreateUsers */
router.post("/", requireSession, validate(createUserSchema), createUser);

/* [DELETE] http://localhost:3000/api/users */
/* canDeleteUser */
router.delete("/:id", requireSession, deleteUser);

/* [DELETE] http://localhost:3000/api/users */
router.delete("/", requireSession, deleteAccount);

/* [POST] http://localhost:3000/api/users/me/contact-persons */
router.post(
  "/me/contact-persons",
  requireSession,
  validate(createContactPersonsSchema),
  createContactPersons,
);

export default router;
