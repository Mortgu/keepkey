import { Router } from "express";
import { getNextcloudStatus } from "../controllers/nextcloud-controller.js";

const router = Router()

/* [GET] /api/nextcloud/status */
router.get('/status', getNextcloudStatus);


export default router;