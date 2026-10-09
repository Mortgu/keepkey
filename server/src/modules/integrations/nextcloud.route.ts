import { Router } from 'express';
import { validateParams, validateQuery } from "@/core/middleware/zod.middleware.js";
import { idParamsSchema } from "@/core/params.schemas.js";
import { cloudDirectoryQuerySchema } from "@keepit/schemas";
import { getCloudDirectory, getCloudStatus, getFilesById, getOfferFileById, getOfferFiles, getOrderFileById } from "./nextcloud.controller.js";

const router = Router();

/* [GET] /api/cloud/directory */
router.get('/directory', validateQuery(cloudDirectoryQuerySchema), getCloudDirectory);

/* [GET] /api/cloud/status */
router.get('/status', getCloudStatus);

/* [GET] /api/cloud/offer */
router.get('/offer', getOfferFiles);

/* [GET] /api/cloud/offer/:id */
router.get('/offer/:id', validateParams(idParamsSchema), getOfferFileById);

/* [GET] /api/cloud/order/:id */
router.get('/order/:id', validateParams(idParamsSchema), getOrderFileById);

/* [GET] /api/cloud/:id */
router.get('/:id', validateParams(idParamsSchema), getFilesById);


export default router;
