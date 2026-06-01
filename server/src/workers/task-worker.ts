import {Job, Queue, Worker} from "bullmq";
import connection from "../lib/redis.js";
import {TaskStatus} from "@prisma/client";
import {prisma} from "../lib/prisma.js";
import logger from "../middlewares/logger.js";
import offerTaskHandler from "./handler/offer-task-handler.js";
import orderTaskHandler from "./handler/order-task-handler.js";

interface jobData {
    taskId: string;
}

export const taskQueueKey = "task-queue";

export const taskQueue = new Queue(taskQueueKey, {
    connection
});

export default function registerTaskWorker() {
    const taskWorker = new Worker<jobData>(taskQueueKey, taskHandler, {
        connection, concurrency: 2
    });

    taskWorker.on("active", async (job: Job<jobData>) => {
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

    taskWorker.on("completed", async (job: Job<jobData>) => {
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

const taskHandler = async (job: Job<jobData>) => {
    const {taskId} = job.data;

    const task = await prisma.task.findUnique({
        where: {id: taskId},
    });

    if (!task) {
        throw new Error("Task not found!");
    }

    switch (task.target) {
        case "OFFER":
            await offerTaskHandler(task);
            break;
        case "ORDER":
            await orderTaskHandler(task);
            break;
        case "RENEWAL":
            break;
    }
}