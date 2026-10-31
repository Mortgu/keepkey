import { Router } from "express";

import { getAllPersons, getPersonById } from "@/controllers/index.js";

const router = Router();

/* [GET] /api/persons/ */
router.get("/", getAllPersons);

/* [GET] /api/persons/:id  */
router.get('/:id', getPersonById);

export default router;
