import { Router } from "express";
import {
  createContactPersons,
  createUser,
  deleteUser,
  getUsers,
  getSessionUser,
  updateUserById,
} from "@/controllers/index.js";
import { validate, validateQuery } from "@/middlewares/zod.middleware.js";
import {
  createContactSchema,
  createUserSchema,
  updateUserSchema,
  userFilterSchema,
} from "@keepit/schemas";

const router = Router();

router.get("/", validateQuery(userFilterSchema), getUsers);

router.get("/session", getSessionUser);

router.put("/:id", validate(updateUserSchema), updateUserById);

router.post("/", validate(createUserSchema), createUser);

router.delete("/:id", deleteUser);

router.post(
  "/me/contact-persons",
  validate(createContactSchema),
  createContactPersons,
);

export default router;
