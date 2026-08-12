import { Router } from "express";
import {
    confirmReplacementUpload,
    createReplacementUpload,
    deleteDocument,
    downloadDocument,
    getDocumentCapabilities,
    renameDocument,
    resyncDocument,
    uploadDocument,
} from "@/controllers/index.js";
import { validate, validateParams } from "@/middlewares/zod.middleware.js";
import {
    confirmReplacementSchema,
    documentArtifactParamsSchema,
    documentParamsSchema,
    renameDocumentSchema,
} from "@/schemas/document-schemas.js";

const router = Router();

/* Was diese Umgebung beim Ersetzen von Dateien überhaupt hergibt. */
router.get("/capabilities", getDocumentCapabilities);

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
/* Erneut nach Nextcloud übertragen, nachdem die Datei ersetzt wurde. */
router.post(
    "/:type/:documentId/resync",
    validateParams(documentParamsSchema),
    resyncDocument,
);
router.get(
    "/:type/:documentId/artifacts/:format",
    validateParams(documentArtifactParamsSchema),
    downloadDocument,
);

/* Signierte URL anfordern, um die erzeugte Datei zu ersetzen. */
router.post(
    "/:type/:documentId/artifacts/:format/upload-url",
    validateParams(documentArtifactParamsSchema),
    createReplacementUpload,
);

/* Den abgeschlossenen Direkt-Upload übernehmen. */
router.post(
    "/:type/:documentId/artifacts/:format/replace",
    validateParams(documentArtifactParamsSchema),
    validate(confirmReplacementSchema),
    confirmReplacementUpload,
);

export default router;