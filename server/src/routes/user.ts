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


router.get("/", canViewUsers, getAllUsers);

router.get("/session", getSessionUser);

router.put("/:id", canUpdateUsers, validate(updateUserSchema), updateUserById);

router.post("/", canCreateUsers, validate(createUserSchema), createUser);

router.delete("/:id", canDeleteUsers, deleteUser);

router.post(
  "/me/contact-persons",
  validate(createContactPersonsSchema),
  createContactPersons,
);

export default router;
