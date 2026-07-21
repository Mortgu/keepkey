import { Router } from "express";

import { getAllContactPersons } from "@/controllers/index.js";

const router = Router();

router.get("/", getAllContactPersons);

export default router;
