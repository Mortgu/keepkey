import { Router } from "express";
import {
    deleteDocument,
    downloadDocument,
    renameDocument,
    uploadDocument,
} from "../controllers/index.js";
import { validate, validateParams } from "../middlewares/validate.js";
import {
    documentArtifactParamsSchema,
    documentParamsSchema,
    renameDocumentSchema,
} from "../schemas/document-schemas.js";

const router = Router();

router.patch(
    "/:type/:documentId",
    validateParams(documentParamsSchema),
    validate(renameDocumentSchema),
    renameDocument,
);
router.delete(
    "/:type/:documentId",
    validateParams(documentParamsSchema),
    deleteDocument,
);
router.post(
    "/:type/:documentId/upload",
    validateParams(documentParamsSchema),
    uploadDocument,
);
router.get(
    "/:type/:documentId/artifacts/:format",
    validateParams(documentArtifactParamsSchema),
    downloadDocument,
);

export default router;
