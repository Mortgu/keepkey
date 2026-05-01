import { Router } from "express";
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
router.get("/", getOffers);

/* [GET] http://localhost:3000/api/offers/:id */
router.get("/:id", getOfferById);

router.delete("/:id", deleteOffer);

/* [GET] http://localhost:3000/api/offers/:id/jobs */
router.get("/:id/jobs", getOfferJobs);

/* [GET] http://localhost:3000/api/offers/:id/jobs/:jobId */
router.get("/:id/jobs/:jobId", getOfferJobById);

/* [POST] http://localhost:3000/api/offers */
router.post(
  "/",
  validate(createOfferSchema),
  createOffer,
  createOfferDocumentJob,
);

/* [DELETE] http://localhost:3000/api/offers */
router.delete("/", deleteOffer);

export default router;
