import {Task} from "@prisma/client";
import {offerGenerateJob, offerReservationJob, offerUploadJob} from "../jobs/index.js";

export default async function offerTaskHandler(task: Task) {
    const {type: taskType} = task;

    switch (taskType) {
        case "GENERATION":
            await offerGenerateJob(task);
            break;
        case "UPLOAD":
            await offerUploadJob(task);
            break;
        case "RESERVATION":
            await offerReservationJob(task);
            break;
    }
}