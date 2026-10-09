import { Router } from "express";

import {
  createOffer,
  deleteOffer,
  enqueueGeneration,
  extendOffer,
  getExtensionPrice,
  getOfferById,
  getOffers,
  renewOffer,
  updateOffer,
} from "./offer.controller.js";

import { validate, validateParams, validateQuery } from "@/core/middleware/zod.middleware.js";
import {
  createOfferSchema,
  extendOfferSchema,
  extensionPriceQuerySchema,
  offerFilterSchema,
  updateOfferSchema,
} from '@keepit/schemas';
import {
  idParamsSchema,
  offerPositionParamsSchema,
} from "@/core/params.schemas.js";

const router = Router();

/* ========== Offer ========== */

/* [GET] /api/offers */
router.get('/', validateQuery(offerFilterSchema), getOffers);

/* [GET] /api/offers/:id */
router.get('/:id', validateParams(idParamsSchema), getOfferById);

/* [POST] /api/offers  */
router.post('/', validate(createOfferSchema), createOffer);

/* [PATCH] /api/offers/:id */
router.patch('/:id', validateParams(idParamsSchema), validate(updateOfferSchema), updateOffer);

/* [DELETE] /api/offers/:id */
router.delete('/:id', validateParams(idParamsSchema), deleteOffer);

/* [POST] /api/offers/:id/renew */
router.post('/:id/renew', validateParams(idParamsSchema), validate(createOfferSchema), renewOffer);

/* [POST] /api/offers/:id/extend — Lizenzerweiterung */
router.post('/:id/extend', validateParams(idParamsSchema), validate(extendOfferSchema), extendOffer);

/* ========== Offer Positions ========== */

/* [GET] /api/offers/:offerId/positions/:positionId/extension-price */
router.get(
    '/:offerId/positions/:positionId/extension-price',
    validateParams(offerPositionParamsSchema),
    validateQuery(extensionPriceQuerySchema),
    getExtensionPrice,
);

/* ========== Offer Documents ========== */

/* [POST] /api/offers/:id/documents */
router.post('/:id/documents', validateParams(idParamsSchema), enqueueGeneration);

export default router;
