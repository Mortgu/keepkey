import {Router} from "express";
import {getNextcloudStatus} from "../controllers/nextcloud-controller.js";
import {validate} from "../middlewares/validate.js";
import {reserveSchema} from "../schemas/nextcloud-schemas.js";

const router = Router()

/* [GET] /api/nextcloud/status */
router.get('/status', getNextcloudStatus);

/* [POST] /api/nextcloud/reserve */
router.post('/reserve', validate(reserveSchema), () => {
})

export default router;