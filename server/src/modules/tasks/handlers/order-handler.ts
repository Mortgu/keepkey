import { Task } from "@prisma/client";
import { generateOrderDocument } from "@/modules/documents/generation/document-generation.service.js";

export default async function orderTaskHandler(task: Task): Promise<void> {
    await generateOrderDocument(task.id);
}
