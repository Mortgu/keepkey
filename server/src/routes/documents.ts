import { Router } from "express";
import { renameDocument, uploadDocument } from "../controllers/documents-controller.js";
import { validate } from "../middlewares/validate.js";
import { renameDocumentSchema } from "../schemas/document-schemas.js";

const router = Router();

/* [POST] /api/documents/:id */
router.post('/:id', validate(renameDocumentSchema), renameDocument);

/* [POST] /api/documents/:id/upload */
router.post('/:id/upload', uploadDocument);

export default router;
