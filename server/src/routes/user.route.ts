import { Router } from "express";
import {
  createContactPersons,
  createUser,
  deleteUser,
  getUsers,
  getSessionUser,
  updateUserById,
} from "@/controllers/index.js";
import { requireAdmin } from "@/middlewares/auth.middleware.js";
import { validate, validateQuery } from "@/middlewares/zod.middleware.js";
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

router.put("/:id", requireAdmin, validate(updateUserSchema), updateUserById);

router.post("/", requireAdmin, validate(createUserSchema), createUser);

router.delete("/:id", requireAdmin, deleteUser);

router.post(
  "/me/contact-persons",
  validate(createContactSchema),
  createContactPersons,
);

export default router;
