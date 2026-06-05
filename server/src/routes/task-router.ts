import {Router} from "express";
import {getAllTasks, getTaskById} from "../controllers/task-controller.js";

const router = Router();

router.get("/", getAllTasks);

/* [GET] /api/tasks/:id */
router.get("/:id", getTaskById);

//router.post('/:id',)

export default router;
