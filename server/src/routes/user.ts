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

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         salutation:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         phone:
 *           type: string
 *           nullable: true
 *         email:
 *           type: string
 *           format: email
 *         emailVerified:
 *           type: boolean
 *         image:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *           nullable: true
 *         banned:
 *           type: boolean
 *           nullable: true
 *         banReason:
 *           type: string
 *           nullable: true
 *         banExpires:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         customerId:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ContactPerson:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         customerId:
 *           type: string
 *         salutation:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Alle Benutzer abrufen
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Liste aller Benutzer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Keine Berechtigung
 */
router.get("/", canViewUsers, getAllUsers);

/**
 * @openapi
 * /api/users/session:
 *   get:
 *     tags:
 *       - Users
 *     summary: Aktuell eingeloggten Benutzer abrufen
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Der eingeloggte Benutzer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Nicht eingeloggt
 */
router.get("/session", getSessionUser);

/**
 * @openapi
 * /api/users/{id}:
 *   post:
 *     tags:
 *       - Users
 *     summary: Benutzer aktualisieren
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               salutation:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *               banned:
 *                 type: boolean
 *               banReason:
 *                 type: string
 *               banExpires:
 *                 type: string
 *                 format: date-time
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Benutzer erfolgreich aktualisiert
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ungültige Anfrage
 *       403:
 *         description: Keine Berechtigung
 */
router.put("/:id", canUpdateUsers, validate(updateUserSchema), updateUserById);

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Neuen Benutzer erstellen
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Benutzer erfolgreich erstellt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ungültige Anfrage
 *       403:
 *         description: Keine Berechtigung
 */
router.post("/", canCreateUsers, validate(createUserSchema), createUser);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Benutzer löschen
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Benutzer erfolgreich gelöscht
 *       403:
 *         description: Keine Berechtigung
 *       500:
 *         description: Serverfehler
 */
router.delete("/:id", canDeleteUsers, deleteUser);

/**
 * @openapi
 * /api/users/me/contact-persons:
 *   post:
 *     tags:
 *       - Users
 *     summary: Kontaktpersonen für den eigenen Account erstellen
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             minItems: 1
 *             items:
 *               type: object
 *               required:
 *                 - salutation
 *                 - firstName
 *                 - lastName
 *               properties:
 *                 salutation:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *                   format: email
 *     responses:
 *       200:
 *         description: Kontaktpersonen erfolgreich erstellt
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContactPerson'
 *       400:
 *         description: Ungültige Anfrage
 */
router.post(
  "/me/contact-persons",
  validate(createContactPersonsSchema),
  createContactPersons,
);

export default router;
