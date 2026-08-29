import { Router } from "express";

import { getActivities } from "@/controllers/activity.controller.js";
import { validateQuery } from "@/middlewares/zod.middleware.js";
import { activityFilterSchema } from "@keepit/schemas";

const router = Router();

/* [GET] /api/activities?entity=&cursor=&limit= */
router.get("/", validateQuery(activityFilterSchema), getActivities);

export default router;
