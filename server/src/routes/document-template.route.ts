import express, { Router } from "express";

import {
    activateDocumentTemplate,
    deleteDocumentTemplate,
    downloadDocumentTemplate,
    getDocumentTemplateContent,
    getDocumentTemplates,
    renameDocumentTemplate,
    replaceDocumentTemplateContent,
    uploadDocumentTemplate,
} from "@/controllers/index.js";
import { DOCX_MIME } from "@/services/document-template.service.js";
import { validate, validateParams, validateQuery } from "@/middlewares/zod.middleware.js";
import {
    documentTemplateParamsSchema,
    renameDocumentTemplateSchema,
    uploadDocumentTemplateQuerySchema,
} from "@/schemas/document-template-schemas.js";

const router = Router();

/**
 * Datei-Body, routen-lokal — das globale `express.json()` bleibt unberuehrt.
 *
 * `type` steht bewusst auf dem DOCX-Typ statt auf `() => true`: kommt etwas
 * anderes an, bleibt der Body leer und der Service antwortet mit einem
 * verstaendlichen `EMPTY_FILE` statt mit einem JSON-Parserfehler.
 *
 * Das Limit liegt absichtlich ueber der fachlichen Grenze. Ein 413 des
 * Body-Parsers traegt ein numerisches `status` und wird vom Fehler-Handler als
 * WebDAV-Fehler gedeutet ("Fehler bei der Kommunikation mit dem
 * Cloud-Speicher"). Die echte Grenze zieht der Service, mit passender Meldung.
 */
const docxBody = express.raw({ type: DOCX_MIME, limit: "50mb" });

/* [GET] /api/templates */
router.get("/", getDocumentTemplates);

/* [POST] /api/templates?kind=&language=&fileName=&name= */
router.post(
    "/",
    docxBody,
    validateQuery(uploadDocumentTemplateQuerySchema),
    uploadDocumentTemplate,
);

/* [PATCH] /api/templates/:id */
router.patch(
    "/:id",
    validateParams(documentTemplateParamsSchema),
    validate(renameDocumentTemplateSchema),
    renameDocumentTemplate,
);

/* [POST] /api/templates/:id/activate — "Vorlage setzen" */
router.post(
    "/:id/activate",
    validateParams(documentTemplateParamsSchema),
    activateDocumentTemplate,
);

/* [PUT] /api/templates/:id/content — der Editor speichert hierueber */
router.put(
    "/:id/content",
    docxBody,
    validateParams(documentTemplateParamsSchema),
    replaceDocumentTemplateContent,
);

/* [GET] /api/templates/:id/content — der Editor liest hierueber */
router.get(
    "/:id/content",
    validateParams(documentTemplateParamsSchema),
    getDocumentTemplateContent,
);

/* [GET] /api/templates/:id/download */
router.get(
    "/:id/download",
    validateParams(documentTemplateParamsSchema),
    downloadDocumentTemplate,
);

/* [DELETE] /api/templates/:id */
router.delete(
    "/:id",
    validateParams(documentTemplateParamsSchema),
    deleteDocumentTemplate,
);

export default router;
