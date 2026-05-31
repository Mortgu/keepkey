import {Router} from "express";
import {
  createOffer,
  deleteOffer,
  deleteOfferDocument,
  downloadOfferDocument,
  getNextQuoteId,
  getOfferById,
  getOfferRevisions,
  getOffers,
  getOfferTaskById,
  getOfferTasks,
  reserveQuoteId,
  updateOffer,
} from "../controllers/offer-controller.js";
import {validate} from "../middlewares/validate.js";
import {createOfferSchema} from "../schemas/index.js";

const router = Router();

router.get("/", getOffers);

router.get('/next', getNextQuoteId);

router.get("/:id/revisions", getOfferRevisions);

router.post('/:id/reserve', reserveQuoteId)

router.get("/:id", getOfferById);

router.put('/:id', updateOffer);

router.delete("/:id", deleteOffer);

router.get("/:id/jobs", getOfferTasks);

router.get("/:id/jobs/:jobId", getOfferTaskById);

router.get("/:id/documents/:documentId/:format", downloadOfferDocument);

router.delete("/:id/documents/:documentId", deleteOfferDocument);

router.post("/", validate(createOfferSchema), createOffer);

export default router;
