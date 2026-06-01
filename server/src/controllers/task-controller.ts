import {Request, Response} from "express";

export const getAllTasks = async (request: Request, response: Response) => {
    try {
        const tasks = await prisma.task.findMany();
        return response.status(200).json(tasks);
    } catch (exception: any) {
        return response.status(500).json({
            message: "Something went wrong trying to fetch tasks!",
        });
    }
};

export const getTaskById = async (request: Request, response: Response) => {
    const {id} = request.params;

    if (!id) {
        return response.status(400).json({
            message: "Bad request!",
        });
    }

    try {
        const task = await prisma.task.findUnique({
            where: {id: id as string},
        });

        return response.status(200).json(task);
    } catch (exception: any) {
        return response.status(500).json({
            message: "Something went wrong trying to fetch task!",
        });
    }
};
