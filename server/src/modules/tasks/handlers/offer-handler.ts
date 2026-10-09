import { Task } from "@/core/prisma.js";
import { generateOfferDocument } from "@/modules/documents/generation/document-generation.service.js";

export default async function offerTaskHandler(task: Task): Promise<void> {
    await generateOfferDocument(task.id);
}
