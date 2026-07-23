import { Router } from "express";

import {
  createOffer,
  deleteOffer,
  enqueueGeneration,
  getOfferById,
  getOfferRevisions,
  getOffers,
  restoreOfferRevision,
  updateOffer,
} from "@/controllers/offer.controller.js";

import { notImplemented } from "@/utils/not-implemented.js";
import { validate } from "@/middlewares/zod.middleware.js";
import {
  restoreOfferRevisionSchema,
  updateOfferFlatrateSchema,
  updateOfferPositionSchema,
} from "@/schemas/index.js";

import {
  createOfferSchema,
  updateOfferSchema,

  createOfferPositionSchema,
  createOfferFlatrateSchema,
} from '@keepit/schemas';

const router = Router();

/* ========== Offer ========== */

/* [GET] /api/offers */
router.get('/', getOffers);

/* [GET] /api/offers/:id */
router.get('/:id', getOfferById);

/* [POST] /api/offers  */
router.post('/', validate(createOfferSchema), createOffer);

/* [PATCH] /api/offers/:id */
router.patch('/:id', validate(updateOfferSchema), updateOffer);

/* [DELETE] /api/offers/:id */
router.delete('/:id', deleteOffer);

/* ========== Offer Position ========== */

/* [GET] /api/offers/:id/positions */
router.get('/:id/positions', notImplemented);

/* [POST] /api/offers/:id/positions */
router.post('/:id/positions', validate(createOfferPositionSchema), notImplemented);

/* [PATCH] /api/offers/:id/positions/:positionId */
router.patch('/:id/positions/:positionId', validate(updateOfferPositionSchema), notImplemented);

/* [DELETE] /api/offers/:id/position/:positionId */
router.delete('/:id/positions/:positionId', notImplemented);

/* ========== Offer Flatrates ========== */

/* [GET] /api/offers/:id/flatrates */
router.get('/:id/flatrates', notImplemented);

/* [POST] /api/offers/:id/flatrates */
router.post('/:id/flatrates', validate(createOfferFlatrateSchema), notImplemented);

/* [PATCH] /api/offers/:id/flatrates/:flatrateId */
router.patch('/:id/flatrates/:flatrateId', validate(updateOfferFlatrateSchema), notImplemented);

/* [DELETE] /api/offers/:id/flatrates/:flatrateId */
router.delete('/:id/flatrates/:flatrateId', notImplemented);

/* ========== Offer Documents ========== */

/* [GET] /api/offers/:id/documents */
router.get('/:id/documents', notImplemented);

/* [POST] /api/offers/:id/documents */
router.post('/:id/documents', enqueueGeneration);

/* ========== Offer Revisions ========== */

/* [GET] /api/offers/:id/revisions */
router.get('/:id/revisions', getOfferRevisions);

/* [POST] /api/offers/:id/revisions/:revisionId/restore */
router.post('/:id/revisions/:revisionId/restore', validate(restoreOfferRevisionSchema), restoreOfferRevision);

/* ========== Offer Tasks ========== */

/* [GET] /api/offers/:id/tasks */
router.get('/:id/tasks', notImplemented);

export default router;
