import {Router} from "express";
import {deleteDocument, renameDocument, uploadDocument} from "../controllers/documents-controller.js";
import {validate} from "../middlewares/validate.js";
import {renameDocumentSchema} from "../schemas/document-schemas.js";

const router = Router();

/* [POST] /api/documents/:id */
router.post('/:id', validate(renameDocumentSchema), renameDocument);

/* [POST] /api/documents/:id/upload */
router.post('/:id/upload', uploadDocument);

/* [DELETE] /api/documents/:id */
router.delete('/:id', deleteDocument);

export default router;