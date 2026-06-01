import {Job, Worker} from "bullmq";
import {connection, uploadQueueKey} from "../lib/queues.js";
import {TaskStatus} from "@prisma/client";
import logger from "../middlewares/logger.js";
import {prisma} from "../lib/prisma.js";
import {uploadJob, UploadWorkerInterface} from "./upload-job.js";


export default function registerUploadWorker() {

    const uploadWorker = new Worker<UploadWorkerInterface>(uploadQueueKey, uploadJob, {
        connection,
        concurrency: 2
    });

    uploadWorker.on("active", async (job: Job<UploadWorkerInterface>) => {
        const {taskId, taskType} = job.data;

        if (!taskId) {
            throw new Error("Unable to process task with id " + taskId + " in upload worker.");
        }

        try {
            await prisma.task.update({
                where: {id: taskId},
                data: {
                    status: TaskStatus.RUNNING,
                }
            });

            logger.info("task " + taskId + " updated to status RUNNING!");
        } catch (error: any) {
            logger.error("Exception occurred in upload worker trying to update task status!", taskId);
            throw new Error(`Exception occurred in upload worker trying to update task (${taskId}) status!`);
        }
    })

    uploadWorker.on("completed", async (job) => {
        const {taskId, taskType} = job.data;

        if (!taskId) {
            throw new Error("Unable to process task with id " + taskId + "in upload worker.");
        }

        try {
            await prisma.task.update({
                where: {id: taskId},
                data: {
                    status: TaskStatus.COMPLETED,
                }
            });

            logger.info("task " + taskId + " completed");
        } catch (error: any) {
            logger.error("Exception occurred in upload worker trying to update task status!", taskId);
            throw new Error(`Exception occurred in upload worker trying to update task (${taskId}) status!`);
        }
    });

    uploadWorker.on("failed", async (job, error) => {
        if (!job) throw new Error("Something went wrong in upload worker.");

        const {taskId, taskType} = job.data;

        logger.error(`task ${taskId} failed with error: ${error}`);

        if (taskId) {
            try {
                await prisma.task.update({
                    where: {id: taskId},
                    data: {
                        status: TaskStatus.FAILED,
                        error: error.message
                    }
                })
            } catch (error: any) {
                logger.error(`Task failed with error: ${error}`);
                return;
            }
        }

    });

    return uploadWorker;
}