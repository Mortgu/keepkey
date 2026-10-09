import { Router } from "express";

import { getSearch } from "./search.controller.js";
import { validateQuery } from "@/core/middleware/zod.middleware.js";
import { searchQuerySchema } from "@keepit/schemas";

const router = Router();

/* [GET] /api/search?q=...&type=offer|order|customer */
router.get("/", validateQuery(searchQuerySchema), getSearch);

export default router;
