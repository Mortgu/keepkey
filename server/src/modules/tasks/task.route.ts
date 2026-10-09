import { Router } from "express";
import { validateParams } from "@/core/middleware/zod.middleware.js";
import { idParamsSchema } from "@/core/params.schemas.js";

import { getAllTasks, getTaskById } from "./task.controller.js";

const router = Router();

router.get("/", getAllTasks);

/* [GET] /api/tasks/:id */
router.get("/:id", validateParams(idParamsSchema), getTaskById);

export default router;
