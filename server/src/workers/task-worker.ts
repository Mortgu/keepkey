import {Job, Worker} from "bullmq";
import connection from "../lib/redis.js";
import {TaskStatus} from "@prisma/client";
import logger from "../middlewares/logger.js";
import {TaskJobData, taskQueue, taskQueueKey} from "./task-queue.js";
import {prisma} from "../lib/prismaClient.js";

export {taskQueue, taskQueueKey};

export default function registerTaskWorker() {
    const taskWorker = new Worker<TaskJobData>(taskQueueKey, taskHandler, {
        connection, concurrency: 2
    });

    taskWorker.on("active", async (job: Job<TaskJobData>) => {
        const {taskId} = job.data;

        if (!taskId) {
            throw new Error("No taskId provided!");
        }

        try {
            await prisma.task.update({
                where: {id: taskId},
                data: {
                    status: TaskStatus.RUNNING,
                }
            })
        } catch (exception: any) {
            const message = "An error occurred while running task";
            logger.error(exception);
            throw new Error(message);
        }
    });

    taskWorker.on("completed", async (job: Job<TaskJobData>) => {
        const {taskId} = job.data;

        if (!taskId) {
            throw new Error("No taskId provided!");
        }

        try {
            await prisma.task.update({
                where: {id: taskId},
                data: {
                    status: TaskStatus.COMPLETED,
                }
            });
        } catch (exception: any) {
            logger.error(exception);
            throw new Error("Something went wrong!");
        }
    })

    taskWorker.on("failed", async (job, error, prev) => {
        if (!job) {
            throw new Error("Something went wrong!");
        }

        const {taskId} = job.data;

        if (!taskId) {
            throw new Error("No taskId provided!");
        }

        try {
            await prisma.task.update({
                where: {id: taskId},
                data: {
                    status: TaskStatus.FAILED,
                    error: error.message
                }
            });
        } catch (exception: any) {
            logger.error(exception);
            throw new Error("An error occurred while running task");
        }
    });

    return taskWorker;
}

const taskHandler = async (job: Job<TaskJobData>) => {
    const {taskId} = job.data;

    const task = await prisma.task.findUnique({
        where: {id: taskId},
    });

    if (!task) {
        throw new Error("Task not found!");
    }

    switch (task.target) {
        case "OFFER":
            //await offerTaskHandler(task, job.data);
            break;
        case "ORDER":
            //await orderTaskHandler(task, job.data);
            break;
        case "RENEWAL":
            break;
    }
}