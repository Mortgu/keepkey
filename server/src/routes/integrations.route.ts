import { Router } from "express";

import { getStatus } from "@/controllers/index.js";

const router = Router();

/* [GET] /api/integrations/status */
router.get("/status", getStatus);

export default router;
