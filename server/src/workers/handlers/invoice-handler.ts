import { Task } from "@prisma/client";
import { logger } from "better-auth";

export default async function invoiceTaskHandler(task: Task): Promise<void> {
    if (!task) {
        logger.error("called invoiceTaskHandler with undefined or nul task!")
        return;
    }
}