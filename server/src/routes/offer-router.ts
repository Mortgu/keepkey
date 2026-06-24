import { Router } from "express";

import {
  createOffer,
  createOfferFlatrates,
  createOfferPositions,
  deleteOffer,
  deleteOfferDocument,
  enqueueGeneration,
  getOffers,
  updateOffer,
  uploadOfferDocument
} from "../controllers/index.js";

import { validate } from "../middlewares/validate.js";
import { createOfferFlatratesSchema, createOfferPositionsSchema, createOfferSchema, updateOfferDocumentSchema, updateOfferFlatrateSchema, updateOfferPositionSchema, updateOfferSchema } from "../schemas/index.js";

const router = Router();

/* ========== Offer ========== */

/* [GET] /api/offers */
router.get('/', getOffers);

/* [POST] /api/offers  */
router.post('/', validate(createOfferSchema), createOffer);

/* [PATCH] /api/offers/:id */
router.patch('/:id', validate(updateOfferSchema), updateOffer);

/* [DELETE] /api/offers/:id */
router.delete('/:id', deleteOffer);

/* ========== Offer Position ========== */

/* [GET] /api/offers/:id/positions */
router.get('/:id/positions', () => { });

/* [POST] /api/offers/:id/positions */
router.post('/:id/positions', validate(createOfferPositionsSchema), createOfferPositions);

/* [PATCH] /api/offers/:id/positions/:positionId */
router.patch('/:id/positions/:positionId', validate(updateOfferPositionSchema), () => { });

/* [DELETE] /api/offers/:id/position/:positionId */
router.delete('/:id/positions/:positionId', () => { });

/* ========== Offer Flatrates ========== */

/* [GET] /api/offers/:id/flatrates */
router.get('/:id/flatrates', () => { });

/* [POST] /api/offers/:id/flatrates */
router.post('/:id/flatrates', validate(createOfferFlatratesSchema), createOfferFlatrates);

/* [PATCH] /api/offers/:id/flatrates/:flatrateId */
router.patch('/:id/flatrates/:flatrateId', validate(updateOfferFlatrateSchema), () => { });

/* [DELETE] /api/offers/:id/flatrates/:flatrateId */
router.delete('/:id/flatrates/:flatrateId', () => { });

/* ========== Offer Documents ========== */

/* [GET] /api/offers/:id/documents */
router.get('/:id/documents', () => { });

/* [POST] /api/offers/:id/documents */
router.post('/:id/documents', enqueueGeneration);

/* [POST] /api/offers/:id/documents/:documentId/upload */
router.post('/:id/documents/:documentId/upload', uploadOfferDocument);

/* [PATCH] /api/offers/:id/documents/:documentId */
router.patch('/:id/documents/:documentId', validate(updateOfferDocumentSchema), () => { });

/* [DELETE] /api/offers/:id/documents/:documentId */
router.delete('/:id/documents/:documentId', deleteOfferDocument);

/* ========== Offer Revisions ========== */

/* [GET] /api/offers/:id/revisions */
router.get('/:id/revisions', () => { });

/* [DELETE] /api/offers/:id/revisions/:revisionsId */
router.delete('/:id/revisions/:revisionsId', () => { });

/* ========== Offer Tasks ========== */

/* [GET] /api/offers/:id/tasks */
router.get('/:id/tasks', () => { });

export default router;
