import { Router } from "express";

import { getStats } from "./dashboard.controller.js";

const router = Router();

/* [GET] /api/dashboard/stats — Kennzahlen und Zeitreihe der letzten Monate */
router.get("/stats", getStats);

export default router;
