import { Router } from "express";

import {
  createOffer,
  deleteOffer,
  deleteOfferDocument,
  downloadOfferDocument,
  enqueueGeneration,
  getNextQuoteId,
  getOfferById,
  getOfferRevisions,
  getOffers,
  updateOffer,
  uploadOfferDocument
} from "../controllers/index.js";

import { validate } from "../middlewares/validate.js";
import { createOfferSchema } from "../schemas/index.js";


const router = Router();

router.get("/", getOffers);

router.get('/next', getNextQuoteId);

router.get("/:id/revisions", getOfferRevisions);

router.post('/:id/upload/:documentId', uploadOfferDocument);

router.post('/:id/document', enqueueGeneration);

router.get("/:id/documents/:documentId/:format", downloadOfferDocument);

router.delete("/:id/documents/:documentId", deleteOfferDocument);

router.get("/:id", getOfferById);

router.put('/:id', updateOffer);

router.delete("/:id", deleteOffer);

router.post("/", validate(createOfferSchema), createOffer);

export default router;
