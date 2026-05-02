import { Router } from "express";
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
  createContactPersonsSchema,
} from "../schemas/index.js";
import {
  canCreateUsers,
  canDeleteUsers,
  canUpdateUsers,
  canViewUsers,
} from "../permissions/user.js";

const router = Router();

/* [GET] http://localhost:3000/api/users */
router.get("/", canViewUsers, getAllUsers);

/* [GET] http://localhost:3000/api/users/session */
router.get("/session", getSessionUser);

/* [POST] http://localhost:3000/api/users/{id} */
router.post("/:id", canUpdateUsers, validate(updateUserSchema), updateUserById);

/* [POST] http://localhost:3000/api/users/ */
/* canCreateUsers */
router.post("/", canCreateUsers, validate(createUserSchema), createUser);

/* [DELETE] http://localhost:3000/api/users */
/* canDeleteUser */
router.delete("/:id", canDeleteUsers, deleteUser);

/* [POST] http://localhost:3000/api/users/me/contact-persons */
router.post(
  "/me/contact-persons",
  validate(createContactPersonsSchema),
  createContactPersons,
);

export default router;
