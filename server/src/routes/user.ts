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

const router = Router();

/* [GET] http://localhost:3000/api/users */
router.get("/", getAllUsers);

/* [GET] http://localhost:3000/api/users/session */
router.get("/session", getSessionUser);

/* [POST] http://localhost:3000/api/users/{id} */
router.post("/:id", validate(updateUserSchema), updateUserById);

/* [POST] http://localhost:3000/api/users/ */
/* canCreateUsers */
router.post("/", validate(createUserSchema), createUser);

/* [DELETE] http://localhost:3000/api/users */
/* canDeleteUser */
router.delete("/:id", deleteUser);

/* [DELETE] http://localhost:3000/api/users */
router.delete("/", deleteAccount);

/* [POST] http://localhost:3000/api/users/me/contact-persons */
router.post(
  "/me/contact-persons",
  validate(createContactPersonsSchema),
  createContactPersons,
);

export default router;
