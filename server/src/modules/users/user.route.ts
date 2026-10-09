import { Router } from "express";
import { createContactPersons, createUser, deleteUser, getUsers, getSessionUser, updateUserById } from "./user.controller.js";
import { requireAdmin } from "@/core/middleware/auth.middleware.js";
import { validate, validateParams, validateQuery } from "@/core/middleware/zod.middleware.js";
import { idParamsSchema } from "@/core/params.schemas.js";
import {
  createContactSchema,
  createUserSchema,
  updateUserSchema,
  userFilterSchema,
} from "@keepit/schemas";

const router = Router();

router.get("/session", getSessionUser);

/* Kein requireAdmin: die Mitarbeiterliste braucht jeder, z. B. für
 * "Unser Ansprechpartner" im Angebots-Modal. Anlegen/Ändern bleibt Admin. */
router.get("/", validateQuery(userFilterSchema), getUsers);

router.put("/:id", requireAdmin, validateParams(idParamsSchema), validate(updateUserSchema), updateUserById);

router.post("/", requireAdmin, validate(createUserSchema), createUser);

router.delete("/:id", requireAdmin, validateParams(idParamsSchema), deleteUser);

router.post(
  "/me/contact-persons",
  validate(createContactSchema),
  createContactPersons,
);

export default router;
