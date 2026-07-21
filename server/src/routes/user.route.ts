import { Router } from "express";
import {
  createContactPersons,
  createUser,
  deleteUser,
  getAllUsers,
  getSessionUser,
  updateUserById,
} from "@/controllers/index.js";
import { validate } from "@/middlewares/zod.middleware.js";
import { createContactPersonsSchema, createUserSchema, updateUserSchema, } from "@/schemas/index.js";

const router = Router();

router.get("/", getAllUsers);

router.get("/session", getSessionUser);

router.put("/:id", validate(updateUserSchema), updateUserById);

router.post("/", validate(createUserSchema), createUser);

router.delete("/:id", deleteUser);

router.post(
  "/me/contact-persons",
  validate(createContactPersonsSchema),
  createContactPersons,
);

export default router;
