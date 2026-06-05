import { Router } from "express";
import { deleteDocument, renameDocument } from "../controllers/documents-controller.js";
import { validate } from "../middlewares/validate.js";
import { renameDocumentSchema } from "../schemas/document-schemas.js";

const router = Router();

/* [POST] /api/documents/:id */
router.post('/:id', validate(renameDocumentSchema), renameDocument);

/* [DELETE] /api/documents/:id */
router.delete('/:id', deleteDocument);

export default router;