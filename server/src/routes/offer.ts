import { Router } from "express";
import {
  createOffer,
  createOfferTask,
  deleteOffer,
  downloadOfferDocument,
  getOfferById,
  getOfferTaskById,
  getOfferTasks,
  getOffers,
  updateOffer,
} from "../controllers/offer-controller.js";
import { validate } from "../middlewares/validate.js";
import { createOfferSchema } from "../schemas/index.js";

const router = Router();

router.get("/", getOffers);

router.get("/:id", getOfferById);

router.put('/:id', updateOffer, createOfferTask);

router.delete("/:id", deleteOffer);

router.get("/:id/jobs", getOfferTasks);

router.get("/:id/jobs/:jobId", getOfferTaskById);

router.get("/:id/documents/:documentId/:format", downloadOfferDocument);

router.post("/", validate(createOfferSchema), createOffer, createOfferTask);

export default router;
