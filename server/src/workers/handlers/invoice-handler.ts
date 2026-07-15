import { Task } from "@prisma/client";
export default async function invoiceTaskHandler(task: Task): Promise<void> {
    if (!task) {
        throw new Error("Invoice task handler was called without a task.");
    }

    throw new Error(`Invoice generation is not implemented (task ${task.id}).`);
}
