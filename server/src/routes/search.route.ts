import { Router } from "express";

import { getSearch } from "@/controllers/index.js";
import { validateQuery } from "@/middlewares/zod.middleware.js";
import { searchQuerySchema } from "@keepit/schemas";

const router = Router();

/* [GET] /api/search?q=...&type=offer|order|customer */
router.get("/", validateQuery(searchQuerySchema), getSearch);

export default router;
