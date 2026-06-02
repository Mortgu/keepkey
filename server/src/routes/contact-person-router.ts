import { Router } from "express";
import { getAllContactPersons } from "../controllers/contact-person-controller.js";

const router = Router();

router.get("/", getAllContactPersons);

export default router;
