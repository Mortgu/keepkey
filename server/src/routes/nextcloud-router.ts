import express, {Router} from 'express';
import {
    deleteTemplate,
    downloadTemplate,
    getCloudDirectory,
    getCloudStatus,
    getFilesById,
    getOfferFileById,
    getOfferFiles,
    getOrderFileById,
    getTemplates,
    uploadTemplate
} from "../controllers/index.js";

const router = Router();

/* [GET] /api/cloud/directory */
router.get('/directory', getCloudDirectory);

/* [GET] /api/cloud/status */
router.get('/status', getCloudStatus);

/* [GET] /api/cloud/offer */
router.get('/offer', getOfferFiles);

/* [GET] /api/cloud/offer/:id */
router.get('/offer/:id', getOfferFileById);

/* [GET] /api/cloud/order/:id */
router.get('/order/:id', getOrderFileById);

/* [GET] /api/cloud/templates */
router.get('/templates', getTemplates);

/* [POST] /api/cloud/templates?filename=... — body is the raw file content */
router.post('/templates', express.raw({ type: () => true, limit: '25mb' }), uploadTemplate);

/* [GET] /api/cloud/templates/:filename/download */
router.get('/templates/:filename/download', downloadTemplate);

/* [DELETE] /api/cloud/templates/:filename */
router.delete('/templates/:filename', deleteTemplate);

/* [GET] /api/cloud/:id */
router.get('/:id', getFilesById);


export default router;
