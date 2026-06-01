import {Task} from "@prisma/client";
import {orderGenerateJob, orderReservationJob, orderUploadJob} from "../jobs/index.js";
import {TaskJobData} from "../task-queue.js";

export default async function orderTaskHandler(task: Task, jobData: TaskJobData) {
    const {type: taskType} = task;

    switch (taskType) {
        case "GENERATION":
            await orderGenerateJob(task);
            break;
        case "UPLOAD":
            await orderUploadJob(task);
            break;
        case "RESERVATION":
            await orderReservationJob(task);
            break;
    }
}