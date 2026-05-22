import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { updateSettings } from "../controllers/settings-controller.js";
import { updateSettingSchema } from "../schemas/settings-schema.js";

const router = Router()

/* [PATCH] /api/settings */
router.patch('/', validate(updateSettingSchema), updateSettings);

export default router;