import {Task} from "@prisma/client";
import {TaskJobData} from "../task-queue.js";

export default async function offerTaskHandler(task: Task, jobData: TaskJobData) {
    const {type: taskType} = task;

    switch (taskType) {
        case "GENERATION":
            //await offerGenerateJob(task);
            break;
        case "UPLOAD":
            //await offerUploadJob(task);
            break;
        case "RESERVATION":
            //await offerReservationJob(task, jobData.chainGenerationOnSuccess);
            break;
    }
}