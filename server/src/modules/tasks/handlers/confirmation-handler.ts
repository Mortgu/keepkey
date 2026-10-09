import { Task } from "@prisma/client";
import { generateConfirmationDocument } from "@/modules/confirmations/confirmation-generation.service.js";

export default async function confirmationTaskHandler(task: Task): Promise<void> {
    await generateConfirmationDocument(task.id);
}
