import { Router } from "express";
import { getSearch } from "../controllers/index.js";

const router = Router();

/* [GET] /api/search?q=...&type=offer|order|customer */
router.get("/", getSearch);

export default router;
