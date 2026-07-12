import { Request, Response } from "express";

import * as taskService from "../services/task.service.js";

/* ========== GET ========== */

export const getAllTasks = async (request: Request, response: Response) => {
    const tasks = await taskService.getAllTasks();
    return response.status(200).json(tasks);
};

export const getTaskById = async (request: Request, response: Response) => {
    const task = await taskService.getTaskById(request.params.id as string);
    return response.status(200).json(task);
};
