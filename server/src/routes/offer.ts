import { Router } from "express";
import { requireSession } from "../middlewares/auth.js";
import {
  createOffer,
  createOfferDocumentJob,
  deleteOffer,
  getOfferById,
  getOfferJobById,
  getOfferJobs,
  getOffers,
} from "../controllers/offer-controller.js";
import { validate } from "../middlewares/validate.js";
import { createOfferSchema } from "../schemas/index.js";

const router = Router();

/* [GET] http://localhost:3000/api/offers */
router.get("/", requireSession, getOffers);

/* [GET] http://localhost:3000/api/offers/:id */
router.get("/:id", getOfferById);

router.delete("/:id", requireSession, deleteOffer);

/* [GET] http://localhost:3000/api/offers/:id/jobs */
router.get("/:id/jobs", getOfferJobs);

/* [GET] http://localhost:3000/api/offers/:id/jobs/:jobId */
router.get("/:id/jobs/:jobId", getOfferJobById);

/* [POST] http://localhost:3000/api/offers */
router.post(
  "/",
  requireSession,
  validate(createOfferSchema),
  createOffer,
  createOfferDocumentJob,
);

/* [DELETE] http://localhost:3000/api/offers */
router.delete("/", requireSession, deleteOffer);

export default router;
