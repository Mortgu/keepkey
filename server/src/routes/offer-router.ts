import {Router} from "express";

import {
  createOffer,
  deleteOffer,
  deleteOfferDocument,
  downloadOfferDocument,
  enqueueDocumentGenerationJob,
  enqueueQuoteReservationJob,
  getNextQuoteId,
  getOfferById,
  getOfferRevisions,
  getOffers,
  updateOffer
} from "../controllers/index.js";

import {validate} from "../middlewares/validate.js";
import {createOfferSchema} from "../schemas/index.js";


const router = Router();

router.get("/", getOffers);

router.get('/next', getNextQuoteId);

router.get("/:id/revisions", getOfferRevisions);

router.post('/:id/reserve', enqueueQuoteReservationJob);

router.post('/:id/document', enqueueDocumentGenerationJob);

router.get("/:id/documents/:documentId/:format", downloadOfferDocument);

router.delete("/:id/documents/:documentId", deleteOfferDocument);

router.get("/:id", getOfferById);

router.put('/:id', updateOffer);

router.delete("/:id", deleteOffer);

router.post("/", validate(createOfferSchema), createOffer);

export default router;
