import { Router } from "express";

import { getAllPersons } from "@/controllers/index.js";

const router = Router();

/* [GET] /api/person/ */
router.get("/", getAllPersons);

export default router;
