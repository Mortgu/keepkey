import { Router } from "express";
import { validateParams } from "@/middlewares/zod.middleware.js";
import { idParamsSchema } from "@/schemas/params-schemas.js";

import { getAllTasks, getTaskById } from "@/controllers/index.js";

const router = Router();

router.get("/", getAllTasks);

/* [GET] /api/tasks/:id */
router.get("/:id", validateParams(idParamsSchema), getTaskById);

export default router;
