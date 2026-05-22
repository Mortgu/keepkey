import { Router } from "express";
import {
  createOffer,
  createOfferTask,
  deleteOffer,
  deleteOfferDocument,
  downloadOfferDocument,
  getNextQuoteId,
  getOfferById,
  getOfferRevisions,
  getOfferTaskById,
  getOfferTasks,
  getOffers,
  reserveQuoteId,
  updateOffer,
} from "../controllers/offer-controller.js";
import { validate } from "../middlewares/validate.js";
import { createOfferSchema, reserveQuoteIdSchema } from "../schemas/index.js";

const router = Router();

router.get("/", getOffers);

router.get('/next', getNextQuoteId);

router.post('/reserve', validate(reserveQuoteIdSchema), reserveQuoteId)

router.get("/:id/revisions", getOfferRevisions);

router.get("/:id", getOfferById);

router.put('/:id', updateOffer, createOfferTask);

router.delete("/:id", deleteOffer);

router.get("/:id/jobs", getOfferTasks);

router.get("/:id/jobs/:jobId", getOfferTaskById);

router.get("/:id/documents/:documentId/:format", downloadOfferDocument);

router.delete("/:id/documents/:documentId", deleteOfferDocument);

router.post("/", validate(createOfferSchema), createOffer, createOfferTask);

export default router;
