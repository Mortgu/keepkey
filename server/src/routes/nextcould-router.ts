import { Router } from "express";
import { getNextcloudPathsHandler, getNextcloudStatusHandler, updateNextcloudPathsHandler } from "../controllers/nextcloud-controller.js";
import { validate } from "../middlewares/validate.js";
import { updateNextcloudPathsSchema } from "../schemas/nextcloud-schemas.js";

const router = Router()

/* [GET] /api/nextcloud/status */
router.get('/status', getNextcloudStatusHandler);

/* [GET] /api/nextcloud/paths */
router.get('/paths', getNextcloudPathsHandler);

/* [PUT] /api/nextcloud/paths */
router.put('/paths', validate(updateNextcloudPathsSchema), updateNextcloudPathsHandler);


export default router;