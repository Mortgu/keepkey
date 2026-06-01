import {Task} from "@prisma/client";
import logger from "../../../middlewares/logger.js";

export async function offerReservationJob(task: Task) {
    logger.info("Task for uploading a reservation document")
}