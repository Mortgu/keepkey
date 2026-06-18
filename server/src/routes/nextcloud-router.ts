import {Router} from 'express';
import {getCloudStatus, getFilesById, getOfferFileById, getOfferFiles, getOrderFileById} from "../controllers/index.js";

const router = Router();

router.get('/status', getCloudStatus);

router.get('/offer', getOfferFiles);
router.get('/offer/:id', getOfferFileById);

router.get('/order/:id', getOrderFileById);

router.get('/:id', getFilesById);

export default router;
