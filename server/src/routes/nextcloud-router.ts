import {Router} from 'express';
import {
    getCloudDirectory,
    getCloudStatus,
    getFilesById,
    getOfferFileById,
    getOfferFiles,
    getOrderFileById
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

/* [GET] /api/cloud/:id */
router.get('/:id', getFilesById);


export default router;
