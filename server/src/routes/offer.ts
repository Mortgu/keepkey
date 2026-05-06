import { Router } from "express";
import {
  createOffer,
  createOfferTask,
  deleteOffer,
  getOfferById,
  getOfferTaskById,
  getOfferTasks,
  getOffers,
  updateOffer,
} from "../controllers/offer-controller.js";
import { validate } from "../middlewares/validate.js";
import { createOfferSchema } from "../schemas/index.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Offer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         supplierId:
 *           type: string
 *         customerId:
 *           type: string
 *         contactPersonId:
 *           type: string
 *         userId:
 *           type: string
 *         voucherId:
 *           type: string
 *         paymentTerm:
 *           type: string
 *         date:
 *           type: string
 *           format: date-time
 *         validUntil:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         requestFrom:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         net_amount:
 *           type: integer
 *           description: Nettobetrag in Cent
 *         tax_rate:
 *           type: integer
 *           description: Steuersatz in Prozent (z.B. 19)
 *         tax_amount:
 *           type: integer
 *           description: Steuerbetrag in Cent
 *         total_amount:
 *           type: integer
 *           description: Bruttobetrag in Cent
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/offers:
 *   get:
 *     tags:
 *       - Offers
 *     summary: Alle Angebote abrufen
 *     responses:
 *       200:
 *         description: Liste aller Angebote
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Offer'
 */
router.get("/", getOffers);

/**
 * @openapi
 * /api/offers/{id}:
 *   get:
 *     tags:
 *       - Offers
 *     summary: Angebot nach ID abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Das Angebot
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offer'
 *       404:
 *         description: Angebot nicht gefunden
 */
router.get("/:id", getOfferById);

router.put('/:id', updateOffer, createOfferTask);

/**
 * @openapi
 * /api/offers/{id}:
 *   delete:
 *     tags:
 *       - Offers
 *     summary: Angebot löschen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Erfolgreich gelöscht
 *       400:
 *         description: Ungültige Anfrage
 *       500:
 *         description: Serverfehler
 */
router.delete("/:id", deleteOffer);

/**
 * @openapi
 * /api/offers/{id}/jobs:
 *   get:
 *     tags:
 *       - Offers
 *     summary: Aktuellen Dokumenten-Job eines Angebots abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Der aktuelle Dokumenten-Job oder null
 */
router.get("/:id/jobs", getOfferTasks);

/**
 * @openapi
 * /api/offers/{id}/jobs/{jobId}:
 *   get:
 *     tags:
 *       - Offers
 *     summary: Einen bestimmten Dokumenten-Job abrufen
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Der Dokumenten-Job
 *       404:
 *         description: Job nicht gefunden
 */
router.get("/:id/jobs/:jobId", getOfferTaskById);

/**
 * @openapi
 * /api/offers:
 *   post:
 *     tags:
 *       - Offers
 *     summary: Neues Angebot erstellen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offer
 *               - positions
 *             properties:
 *               offer:
 *                 type: object
 *                 required:
 *                   - supplierId
 *                   - customerId
 *                   - contactPersonId
 *                   - userId
 *                 properties:
 *                   supplierId:
 *                     type: string
 *                   customerId:
 *                     type: string
 *                   contactPersonId:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   voucherId:
 *                     type: string
 *                   paymentTerm:
 *                     type: string
 *                   validUntil:
 *                     type: string
 *                     nullable: true
 *                   requestFrom:
 *                     type: string
 *                     nullable: true
 *               positions:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - contractId
 *                     - duration_months
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                     contractId:
 *                       type: string
 *                     duration_months:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *                     optional:
 *                       type: boolean
 *               flatRates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - total_cents
 *                   properties:
 *                     id:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       default: 1
 *                     total_cents:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Angebot erfolgreich erstellt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offer'
 *       400:
 *         description: Ungültige Anfrage
 *       408:
 *         description: Fehler beim Erstellen des Angebots
 */
router.post("/", validate(createOfferSchema), createOffer, createOfferTask);

export default router;
