import { Router } from "express";

import { getStatus } from "./integration.controller.js";

const router = Router();

/* [GET] /api/integrations/status */
router.get("/status", getStatus);

export default router;
