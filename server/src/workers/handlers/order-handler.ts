import { Task } from "@prisma/client";
import { generateOrderDocument } from "../../services/document-generation.service.js";

export default async function orderTaskHandler(task: Task): Promise<void> {
    await generateOrderDocument(task.id);
}
