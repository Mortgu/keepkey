import { Router } from "express";
import { getAllTasks, getTaskById } from "../controllers/task-controller.js";

const router = Router();

router.get("/", getAllTasks);

router.get("/:id", getTaskById);

export default router;
