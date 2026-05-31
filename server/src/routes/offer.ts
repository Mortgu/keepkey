import {Router} from "express";
import {
  createOffer,
  deleteOffer,
  deleteOfferDocument,
  downloadOfferDocument,
  generateOfferDocument,
  getNextQuoteId,
  getOfferById,
  getOfferRevisions,
  getOffers,
  reserveQuoteId,
  updateOffer,
} from "../controllers/offer-controller.js";
import {validate} from "../middlewares/validate.js";
import {createOfferSchema} from "../schemas/index.js";

const router = Router();

router.get("/", getOffers);

router.get('/next', getNextQuoteId);

router.get("/:id/revisions", getOfferRevisions);

router.post('/:id/reserve', reserveQuoteId);

router.post('/:id/document', generateOfferDocument);

router.get("/:id/documents/:documentId/:format", downloadOfferDocument);

router.delete("/:id/documents/:documentId", deleteOfferDocument);

router.get("/:id", getOfferById);

router.put('/:id', updateOffer);

router.delete("/:id", deleteOffer);

router.post("/", validate(createOfferSchema), createOffer);

export default router;
