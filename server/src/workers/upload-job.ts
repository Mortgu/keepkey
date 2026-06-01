import {Job} from "bullmq";
import {Task, TaskType} from "@prisma/client";
import {prisma} from "../lib/prisma.js";

export interface UploadWorkerInterface {
    taskId: string;
}

export const uploadJob = async (job: Job<UploadWorkerInterface>) => {
    const {taskId} = job.data;

    const task = await prisma.task.findUnique({
        where: {id: taskId},
    });

    if (!task) {
        throw new Error("Unable to process task with id " + taskId + ". Task not found!");
    }

    switch (task.target) {
        case "OFFER":
            await uploadOfferJob(task, task.type);
            break;
        case "ORDER":
            await uploadOrderJob();
            break;
        case "RENEWAL":
            await uploadORenewalJob();
            break;
        default:
            throw new Error("Unknown task type " + task.type + " in upload worker.");
    }
}

const uploadOfferJob = async (task: Task, type: TaskType) => {
   
}

const uploadOrderJob = async () => {
}

const uploadORenewalJob = async () => {
}
